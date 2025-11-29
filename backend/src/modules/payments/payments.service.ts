import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { Payment } from './entities/payment.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly stripe: StripeService,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
    @InjectRepository(BankAccount)
    private readonly bankAccountsRepo: Repository<BankAccount>,
    @InjectRepository(Payout)
    private readonly payoutsRepo: Repository<Payout>,
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,
  ) {}

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    try {
      const intent = await this.stripe.createPaymentIntent({
        amount: Math.round(dto.amount),
        currency: dto.currency,
        metadata: {
          appointmentId: dto.appointmentId,
          ...(dto.providerId ? { providerId: dto.providerId } : {}),
        },
      });
      return {
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create payment intent: ${err?.message || err}`);
      throw new BadRequestException('Unable to create payment intent');
    }
  }

  private parseCountryFromIban(iban: string): string {
    return iban.slice(0, 2).toUpperCase();
  }

  async createAccountLink(providerId: string, returnUrl: string, refreshUrl: string) {
    if (!this.stripe.isConfigured) throw new BadRequestException('Stripe is not configured');
    const provider = await this.providersRepo.findOne({ where: { id: providerId }, relations: ['user'] });
    if (!provider) throw new BadRequestException('Provider not found');
    const accountId = await this.getOrCreateStripeAccountId(provider);
    const link = await this.stripe.createAccountLink({
      accountId,
      refreshUrl,
      returnUrl,
    });
    return { url: link.url, expiresAt: new Date(link.expires_at * 1000) };
  }

  private async getOrCreateStripeAccountId(provider: ProviderProfile): Promise<string> {
    if (!this.stripe.isConfigured) throw new BadRequestException('Stripe is not configured');
    if (provider.stripeAccountId) return provider.stripeAccountId;
    const country = 'DE';
    const account = await this.stripe.createConnectAccount({
      country,
      businessType: 'individual',
      businessName: provider.businessName || `${provider.user.firstName} ${provider.user.lastName}`,
    });
    provider.stripeAccountId = account.id;
    provider.stripePayoutsEnabled = !!account.payouts_enabled;
    await this.providersRepo.save(provider);
    return account.id;
  }

  async requestPayout(userId: string | undefined, dto: RequestPayoutDto) {
    if (!this.stripe.isConfigured) throw new BadRequestException('Stripe is not configured');
    const amountCents = Math.round(dto.amount);
    if (amountCents <= 0) throw new BadRequestException('Amount must be positive');

    if (!userId) throw new BadRequestException('Authenticated user not found');
    const provider = await this.providersRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!provider) throw new BadRequestException('Provider not found');

    const accountId = await this.getOrCreateStripeAccountId(provider);

    let bankAccount = await this.bankAccountsRepo.findOne({ where: { provider: { id: provider.id }, iban: dto.iban } });
    if (!bankAccount) {
      bankAccount = this.bankAccountsRepo.create({
        provider,
        accountHolderName: provider.businessName || `${provider.user.firstName} ${provider.user.lastName}`,
        iban: dto.iban,
        bankName: 'Unknown',
        isVerified: false,
        isDefault: true,
      });
    }

    // Ensure external account is attached in Stripe Connect
    if (!bankAccount.stripeExternalAccountId) {
      const country = this.parseCountryFromIban(dto.iban);
      const token = await this.stripe.createBankAccountToken({
        country,
        currency: dto.currency,
        accountHolderName: bankAccount.accountHolderName,
        accountNumber: dto.iban,
      });
      const external = await this.stripe.attachExternalAccount({
        accountId,
        tokenId: token.id,
        defaultForCurrency: true,
      });
      bankAccount.stripeExternalAccountId = external.id;
      await this.bankAccountsRepo.save(bankAccount);
    }

    // Transfer funds from platform to connected account (requires platform balance)
    let payoutStripeId: string | undefined;
    let payoutReference: string | undefined;
    let status: PayoutStatus = PayoutStatus.PROCESSING;
    let failureReason: string | undefined;
    try {
      const transfer = await this.stripe.createTransfer({
        amount: amountCents,
        currency: dto.currency,
        destinationAccountId: accountId,
        description: 'Provider payout',
      });
      payoutReference = transfer.id;

      const payout = await this.stripe.createPayout({ amount: amountCents, currency: dto.currency, accountId });
      payoutStripeId = payout.id;
      status = PayoutStatus.COMPLETED;
    } catch (err: any) {
      this.logger.error(`Stripe payout error: ${err?.message || err}`);
      status = PayoutStatus.FAILED;
      failureReason = err?.message || 'Unknown payout error';
    }

    const payoutEntity = this.payoutsRepo.create({
      provider,
      bankAccount,
      amountCents,
      currency: dto.currency,
      status,
      requestedAt: new Date(),
      processedAt: new Date(),
      completedAt: status === PayoutStatus.COMPLETED ? new Date() : null,
      payoutReference: payoutReference,
      stripePayoutId: payoutStripeId,
      failureReason,
    });
    await this.payoutsRepo.save(payoutEntity);

    if (status === PayoutStatus.FAILED) {
      throw new BadRequestException(`Payout failed: ${failureReason}`);
    }
    return {
      id: payoutEntity.id,
      status: payoutEntity.status,
      payoutReference: payoutEntity.payoutReference,
      stripePayoutId: payoutEntity.stripePayoutId,
    };
  }

  async listUserTransactions(userId: string) {
    const qb = this.paymentsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.appointment', 'appt')
      .leftJoinAndSelect('appt.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'providerUser')
      .leftJoinAndSelect('appt.appointmentServices', 'appointmentServices')
      // Use actual DB column name for client foreign key
      .where('appt.client_id = :userId', { userId })
      .orderBy('p.createdAt', 'DESC');

    const payments = await qb.getMany();
    const items = payments.map((p) => {
      const totalPriceCents = (p.appointment.appointmentServices || []).reduce((sum, s: any) => sum + (s.priceCents || 0), 0);
      const providerName = (p.appointment.provider as any)?.user
        ? `${(p.appointment.provider as any).user.firstName} ${(p.appointment.provider as any).user.lastName}`
        : undefined;
      return {
        id: p.id,
        amountCents: p.amountCents,
        paymentMethod: p.paymentMethod,
        status: p.paymentStatus,
        paidAt: p.paidAt,
        appointment: {
          id: p.appointment.id,
          number: p.appointment.appointmentNumber,
          date: p.appointment.appointmentDate,
          startTime: p.appointment.startTime,
          provider: {
            id: p.appointment.provider?.id,
            name: providerName,
            avatarUrl: ((p.appointment.provider as any)?.user?.profilePictureUrl as string) || undefined,
          },
          services: (p.appointment.appointmentServices || []).map((s: any) => ({
            id: s.id,
            name: s.serviceName,
            priceCents: s.priceCents,
          })),
          totalPriceCents,
        },
        createdAt: p.createdAt,
      };
    });
    return { items, count: items.length };
  }

  async listProviderPayouts(userId: string) {
    const qb = this.payoutsRepo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'providerUser')
      .where('providerUser.id = :userId', { userId })
      .orderBy('po.requestedAt', 'DESC');
    const payouts = await qb.getMany();
    const items = payouts.map((po) => ({
      id: po.id,
      amountCents: po.amountCents,
      currency: po.currency,
      status: po.status,
      requestedAt: po.requestedAt,
      processedAt: po.processedAt,
      completedAt: po.completedAt,
      payoutReference: po.payoutReference,
      failureReason: po.failureReason,
    }));
    return { items, count: items.length };
  }
}