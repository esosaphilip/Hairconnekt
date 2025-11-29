import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { Repository, DataSource } from 'typeorm';
import { newDb } from 'pg-mem';
import { User, UserType } from '../users/entities/user.entity';
import { ClientProfile } from '../users/entities/client-profile.entity';
import { Address } from '../users/entities/address.entity';
import { ProviderProfile, BusinessType } from '../providers/entities/provider-profile.entity';
import { ProviderLocation } from '../providers/entities/provider-location.entity';
import { ProviderLanguage } from '../providers/entities/provider-language.entity';
import { ProviderAvailability } from '../providers/entities/provider-availability.entity';
import { ProviderTimeOff } from '../providers/entities/provider-time-off.entity';
import { Service } from '../services/entities/service.entity';
import { ServiceCategory } from '../services/entities/service-category.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentService } from '../appointments/entities/appointment-service.entity';
import { PortfolioImage } from '../portfolio/entities/portfolio-image.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Payout, PayoutStatus } from './entities/payout.entity';

// NOTE: This integration test defaults to skipped due to enum type limitations in in-memory DBs.
// Set RUN_INT_TESTS=true to attempt running with pg-mem, or use a real Postgres (recommended).
const describeInt = process.env.RUN_INT_TESTS === 'true' ? describe : describe.skip;
describeInt('PaymentsService (integration with pg-mem)', () => {
  jest.setTimeout(30000);
  let dataSource: DataSource;
  let service: PaymentsService;
  let usersRepo: Repository<User>;
  let providersRepo: Repository<ProviderProfile>;
  let bankRepo: Repository<BankAccount>;
  let payoutRepo: Repository<Payout>;

  const stripeMock = {
    isConfigured: true,
    createPaymentIntent: jest.fn(),
    createConnectAccount: jest.fn().mockResolvedValue({ id: 'acct_123', payouts_enabled: true }),
    createAccountLink: jest.fn().mockResolvedValue({ url: 'https://stripe.link/onboarding', expires_at: Math.floor(Date.now() / 1000) + 600 }),
    createBankAccountToken: jest.fn().mockResolvedValue({ id: 'tok_123' }),
    attachExternalAccount: jest.fn().mockResolvedValue({ id: 'ba_123' }),
    createTransfer: jest.fn().mockResolvedValue({ id: 'tr_123' }),
    createPayout: jest.fn().mockResolvedValue({ id: 'po_123' }),
  } as unknown as StripeService;

  beforeAll(async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    // Register minimal pg functions used by TypeORM's Postgres driver during initialization
    db.public.registerFunction({ name: 'version', returns: 'text' as any, implementation: () => 'PostgreSQL 13.0 on pg-mem' });
    db.public.registerFunction({ name: 'current_database', returns: 'text' as any, implementation: () => 'test' });

    dataSource = await db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: [
        User,
        ClientProfile,
        Address,
        ProviderProfile,
        ProviderLocation,
        ProviderLanguage,
        ProviderAvailability,
        ProviderTimeOff,
        Service,
        ServiceCategory,
        Appointment,
        AppointmentService,
        PortfolioImage,
        BankAccount,
        Payout,
      ],
      synchronize: true,
    });
    await dataSource.initialize();

    usersRepo = dataSource.getRepository(User);
    providersRepo = dataSource.getRepository(ProviderProfile);
    bankRepo = dataSource.getRepository(BankAccount);
    payoutRepo = dataSource.getRepository(Payout);

    service = new PaymentsService(
      stripeMock,
      providersRepo,
      bankRepo,
      payoutRepo,
    );
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  it('binds provider via authenticated user and persists payout + bank account', async () => {
    // Arrange: create a user and provider profile
    const user = usersRepo.create({
      email: 'prov@example.com',
      phone: '+49123456789',
      passwordHash: 'hash',
      firstName: 'Paula',
      lastName: 'Pro',
      userType: UserType.PROVIDER,
    });
    await usersRepo.save(user);

    const provider = providersRepo.create({
      user,
      businessName: 'Pro Paula',
      businessType: BusinessType.INDIVIDUAL,
      bio: 'Pro stylist',
      cancellationPolicy: '24h',
    });
    await providersRepo.save(provider);

    // Act: request payout with valid DE IBAN
    const res = await service.requestPayout(user.id, {
      amount: 1200,
      currency: 'eur',
      iban: 'DE91100000000123456789',
    });

    // Assert
    expect(res).toMatchObject({ status: PayoutStatus.COMPLETED, payoutReference: 'tr_123', stripePayoutId: 'po_123' });
    const savedBank = await bankRepo.find();
    expect(savedBank.length).toBe(1);
    expect(savedBank[0].stripeExternalAccountId).toBe('ba_123');

    const savedPayouts = await payoutRepo.find({ relations: ['provider', 'bankAccount'] });
    expect(savedPayouts.length).toBe(1);
    expect(savedPayouts[0].provider.id).toBe(provider.id);
    expect(savedPayouts[0].bankAccount.id).toBe(savedBank[0].id);
  });
});