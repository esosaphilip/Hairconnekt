import { http } from './http';

export const providerActivityApi = {
  async feed(params: { limit?: number } = {}) {
    const res = await http.get('/providers/activity-feed', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

