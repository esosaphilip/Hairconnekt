import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { Payment } from './entities/payment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PaymentsService', () => {
  let service: PaymentsService;
  const stripeMock = {
    isConfigured: true,
    createPaymentIntent: jest.fn().mockResolvedValue({ id: 'pi_123', client_secret: 'cs_123', status: 'requires_payment_method' }),
    createConnectAccount: jest.fn().mockResolvedValue({ id: 'acct_123', payouts_enabled: true }),
    createAccountLink: jest.fn().mockResolvedValue({ url: 'https://stripe.link/onboarding', expires_at: Math.floor(Date.now() / 1000) + 600 }),
    createBankAccountToken: jest.fn().mockResolvedValue({ id: 'tok_123' }),
    attachExternalAccount: jest.fn().mockResolvedValue({ id: 'ba_123' }),
    createTransfer: jest.fn().mockResolvedValue({ id: 'tr_123' }),
    createPayout: jest.fn().mockResolvedValue({ id: 'po_123' }),
  } as unknown as StripeService;

  const providerRepoMock = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const bankRepoMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const payoutRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const paymentRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: StripeService, useValue: stripeMock },
        { provide: getRepositoryToken(ProviderProfile), useValue: providerRepoMock },
        { provide: getRepositoryToken(BankAccount), useValue: bankRepoMock },
        { provide: getRepositoryToken(Payout), useValue: payoutRepoMock },
        { provide: getRepositoryToken(Payment), useValue: paymentRepoMock },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('createPaymentIntent returns essential fields', async () => {
    const res = await service.createPaymentIntent({ amount: 10.5, currency: 'eur', appointmentId: 'apt_1' });
    expect(res).toEqual({ id: 'pi_123', clientSecret: 'cs_123', status: 'requires_payment_method' });
  });

  it('createAccountLink creates account when missing and returns url', async () => {
    const provider: Partial<ProviderProfile> = {
      id: 'prov_1',
      user: { firstName: 'Jane', lastName: 'Doe' } as any,
      businessName: 'Stylist Jane',
    };
    providerRepoMock.findOne.mockResolvedValue(provider);
    providerRepoMock.save.mockImplementation(async (p: any) => p);

    const result = await service.createAccountLink('prov_1', 'https://return', 'https://refresh');
    expect(result.url).toContain('stripe.link');
    expect(providerRepoMock.save).toHaveBeenCalled();
  });

  it('requestPayout creates transfer and payout, persists entity', async () => {
    const provider: Partial<ProviderProfile> = {
      id: 'prov_1',
      user: { firstName: 'Jane', lastName: 'Doe' } as any,
      businessName: 'Stylist Jane',
    };
    providerRepoMock.findOne.mockResolvedValue(provider);

    bankRepoMock.findOne.mockResolvedValue(null);
    bankRepoMock.create.mockImplementation((obj: any) => ({ id: 'bank_1', ...obj }));
    bankRepoMock.save.mockImplementation(async (b: any) => b);

    payoutRepoMock.create.mockImplementation((obj: any) => ({ id: 'payout_1', ...obj }));
    payoutRepoMock.save.mockImplementation(async (p: any) => p);

    const res = await service.requestPayout('user_1', { iban: 'DE91100000000123456789', currency: 'eur', amount: 1200 });
    expect(res).toMatchObject({ id: 'payout_1', status: PayoutStatus.COMPLETED, payoutReference: 'tr_123', stripePayoutId: 'po_123' });
    expect(bankRepoMock.save).toHaveBeenCalled();
    expect(payoutRepoMock.save).toHaveBeenCalled();
  });
});