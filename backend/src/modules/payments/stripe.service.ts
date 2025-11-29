import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe?: Stripe;

  constructor() {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      this.logger.warn(
        'STRIPE_SECRET_KEY is not set. Stripe features will be disabled until configured.',
      );
      return;
    }
    // Use the SDK's default pinned API version to avoid type mismatches with literal unions.
    // If you need to target a specific version, prefer configuring it via Stripe dashboard.
    this.stripe = new Stripe(secret);
  }

  get isConfigured() {
    return !!this.stripe;
  }

  async createPaymentIntent(params: {
    amount: number; // amount in smallest currency unit (e.g., cents)
    currency: string;
    metadata?: Record<string, string>;
  }) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }
    const intent = await this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      automatic_payment_methods: { enabled: true },
      metadata: params.metadata,
    });
    return intent;
  }

  async createConnectAccount(params: {
    type?: 'express' | 'standard' | 'custom';
    country: string;
    businessType?: Stripe.AccountCreateParams.BusinessType;
    businessName?: string;
  }): Promise<Stripe.Account> {
    if (!this.stripe) throw new Error('Stripe is not configured');
    const account = await this.stripe.accounts.create({
      type: params.type || 'express',
      country: params.country,
      business_type: params.businessType || 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: params.businessName
        ? { name: params.businessName, product_description: 'Hair styling services' }
        : undefined,
    });
    return account;
  }

  async createAccountLink(params: {
    accountId: string;
    returnUrl: string;
    refreshUrl: string;
  }): Promise<Stripe.AccountLink> {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return this.stripe.accountLinks.create({
      account: params.accountId,
      type: 'account_onboarding',
      return_url: params.returnUrl,
      refresh_url: params.refreshUrl,
    });
  }

  async createBankAccountToken(params: {
    country: string;
    currency: string;
    accountHolderName: string;
    accountNumber: string; // using IBAN for demonstration
  }): Promise<Stripe.Token> {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return this.stripe.tokens.create({
      bank_account: {
        country: params.country,
        currency: params.currency,
        account_holder_name: params.accountHolderName,
        account_number: params.accountNumber,
      },
    });
  }

  async attachExternalAccount(params: {
    accountId: string;
    tokenId: string;
    defaultForCurrency?: boolean;
  }): Promise<Stripe.ExternalAccount> {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return this.stripe.accounts.createExternalAccount(params.accountId, {
      external_account: params.tokenId,
      default_for_currency: params.defaultForCurrency ?? true,
    });
  }

  async createTransfer(params: {
    amount: number;
    currency: string;
    destinationAccountId: string;
    description?: string;
  }): Promise<Stripe.Transfer> {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return this.stripe.transfers.create({
      amount: params.amount,
      currency: params.currency,
      destination: params.destinationAccountId,
      description: params.description,
    });
  }

  async createPayout(params: { amount: number; currency: string; accountId: string }): Promise<Stripe.Payout> {
    if (!this.stripe) throw new Error('Stripe is not configured');
    return this.stripe.payouts.create(
      { amount: params.amount, currency: params.currency },
      { stripeAccount: params.accountId },
    );
  }
}