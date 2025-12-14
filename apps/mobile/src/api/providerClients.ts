import { http } from './http';

export const providerClientsApi = {
  async list(params: { filter?: 'all' | 'repeat' | 'new' | 'vip'; sortBy?: 'recent' | 'name' | 'totalSpent'; search?: string; page?: number; limit?: number } = {}) {
    const res = await http.get('/providers/clients', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async detail(clientId: string) {
    const res = await http.get(`/providers/clients/${clientId}`);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async patchNotes(clientId: string, providerNotes: string) {
    const res = await http.patch(`/providers/clients/${clientId}/notes`, { providerNotes });
    return res?.data;
  },

  async patchVip(clientId: string, isVIP: boolean) {
    const res = await http.patch(`/providers/clients/${clientId}/vip-status`, { isVIP });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async block(clientId: string, reason: string) {
    const res = await http.post(`/providers/clients/${clientId}/block`, { reason });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

