import { http } from './http';

export const providerStatsApi = {
  async summary() {
    const res = await http.get('/providers/me/stats-summary');
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

