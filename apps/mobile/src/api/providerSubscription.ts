import { http } from './http';

export const providerSubscriptionApi = {
  async getCurrent() {
    const res = await http.get('/providers/me/subscription');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async getPlans() {
    const res = await http.get('/subscription-plans');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async changePlan(body: { planId: string; billingCycle: 'monthly' | 'yearly' }) {
    const res = await http.post('/providers/me/subscription/change', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async cancel(body: { reason?: string; feedback?: string; cancelImmediately?: boolean }) {
    const res = await http.post('/providers/me/subscription/cancel', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async billingHistory(params: { page?: number; limit?: number } = {}) {
    const res = await http.get('/providers/me/billing-history', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

