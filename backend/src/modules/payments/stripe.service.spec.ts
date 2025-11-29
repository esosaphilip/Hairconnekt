import { StripeService } from './stripe.service';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_123', client_secret: 'cs_123', status: 'requires_payment_method' }),
    },
    accounts: {
      create: jest.fn().mockResolvedValue({ id: 'acct_123', payouts_enabled: true }),
      createExternalAccount: jest.fn().mockResolvedValue({ id: 'ba_123' }),
    },
    accountLinks: {
      create: jest.fn().mockResolvedValue({ url: 'https://stripe.link/abc', expires_at: Math.floor(Date.now() / 1000) + 600 }),
    },
    tokens: {
      create: jest.fn().mockResolvedValue({ id: 'tok_123' }),
    },
    transfers: {
      create: jest.fn().mockResolvedValue({ id: 'tr_123' }),
    },
    payouts: {
      create: jest.fn().mockResolvedValue({ id: 'po_123' }),
    },
  }));
});

describe('StripeService', () => {
  const originalEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  afterAll(() => {
    process.env = originalEnv;
  });

  it('isConfigured is false when STRIPE_SECRET_KEY is missing', () => {
    delete process.env.STRIPE_SECRET_KEY;
    const svc = new StripeService();
    expect(svc.isConfigured).toBe(false);
  });

  it('creates payment intent when configured', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    const svc = new StripeService();
    expect(svc.isConfigured).toBe(true);
    const intent = await svc.createPaymentIntent({ amount: 1000, currency: 'eur', metadata: { a: 'b' } });
    expect(intent).toMatchObject({ id: 'pi_123', client_secret: 'cs_123' });
  });

  it('connect helpers work as expected', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    const svc = new StripeService();
    const acct = await svc.createConnectAccount({ country: 'DE', businessName: 'Test', businessType: 'individual' });
    expect(acct.id).toBe('acct_123');

    const link = await svc.createAccountLink({ accountId: acct.id, returnUrl: 'https://return', refreshUrl: 'https://refresh' });
    expect(link.url).toContain('stripe.link');

    const token = await svc.createBankAccountToken({ country: 'DE', currency: 'eur', accountHolderName: 'Holder', accountNumber: 'DE993204112101%' });
    expect(token.id).toBe('tok_123');

    const ext = await svc.attachExternalAccount({ accountId: acct.id, tokenId: token.id });
    expect((ext as any).id).toBe('ba_123');

    const transfer = await svc.createTransfer({ amount: 1000, currency: 'eur', destinationAccountId: acct.id });
    expect(transfer.id).toBe('tr_123');

    const payout = await svc.createPayout({ amount: 1000, currency: 'eur', accountId: acct.id });
    expect(payout.id).toBe('po_123');
  });
});