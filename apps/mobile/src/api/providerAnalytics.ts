import { http } from './http';

export const providerAnalyticsApi = {
  async getAnalytics(params: { period?: 'week' | 'month' | 'quarter' | 'year' | 'custom'; startDate?: string; endDate?: string } = {}) {
    const res = await http.get('/providers/analytics', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async exportAnalytics(body: { format: 'pdf' | 'csv' | 'excel'; period: 'week' | 'month' | 'quarter' | 'year' | 'custom'; startDate?: string; endDate?: string; sections?: string[] }) {
    const res = await http.post('/providers/analytics/export', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

