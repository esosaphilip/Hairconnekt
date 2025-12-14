import { http } from './http';

export const providerFinanceApi = {
  async earningsOverview(params: { period?: 'week' | 'month' | 'year' | 'custom'; startDate?: string; endDate?: string } = {}) {
    const res = await http.get('/providers/earnings', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async transactions(params: { page?: number; limit?: number; status?: 'paid' | 'pending' | 'refunded' } = {}) {
    const res = await http.get('/providers/transactions', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async requestPayout(body: { amount: number; bankAccountId: string; payoutMethod: 'bank_transfer' | 'paypal' }) {
    const res = await http.post('/providers/payouts/request', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

