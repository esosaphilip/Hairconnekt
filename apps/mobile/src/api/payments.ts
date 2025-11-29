import { http } from './http';

// Types for payouts coming from backend
export type ProviderPayout = {
  id: string;
  amountCents: number;
  currency: 'eur' | string;
  // Backend enum values are uppercase (e.g., 'PROCESSING', 'COMPLETED', 'FAILED')
  status: string;
  requestedAt?: string | null;
  processedAt?: string | null;
  completedAt?: string | null;
  payoutReference?: string | null;
  failureReason?: string | null;
};

export type ListProviderPayoutsResponse = {
  items: ProviderPayout[];
  count: number;
};

// DTO for requesting a payout (mirrors backend RequestPayoutDto)
export type RequestPayoutDto = {
  amount: number; // major units (e.g., euros)
  currency: 'eur';
  iban: string;
};

export const paymentsApi = {
  async listProviderPayouts() {
    const res = await http.get<ListProviderPayoutsResponse>('/payments/payouts');
    return res.data;
  },
  async requestPayout(payload: RequestPayoutDto) {
    const res = await http.post('/payments/payout', payload);
    return res.data;
  },
  async createAccountLink(providerId: string, returnUrl: string, refreshUrl: string) {
    const res = await http.post('/payments/connect/account-link', { providerId, returnUrl, refreshUrl });
    return res.data;
  },
};

// Helper to convert cents to euros with 2 decimals
export function centsToEuros(cents: number) {
  return Math.round(cents) / 100;
}

// Platform fee rate (temporary, until provided by backend)
export const PLATFORM_FEE_RATE = 0.1; // 10%