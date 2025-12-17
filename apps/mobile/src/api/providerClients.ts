import { http } from './http';
import { IClient } from '../domain/models/client';
import { ClientAdapter } from './adapters/clientAdapter';

export const providerClientsApi = {
  async list(params: { filter?: 'all' | 'repeat' | 'new' | 'vip'; sortBy?: 'recent' | 'name' | 'totalSpent'; search?: string; page?: number; limit?: number } = {}) {
    const res = await http.get('/providers/clients', { params });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      const rawData = (payload as any).data;
      // The API seems to return { items: [], ... } or just [] based on usage in ProviderClients.tsx
      // Let's handle both cases or assume structure based on ProviderClients.tsx usage:
      // In ProviderClients.tsx: setData(res?.data || null); -> data.items
      // So the API returns { items: Client[] } directly?
      // Wait, line 68 in ProviderClients.tsx: setData(res?.data || null);
      // And then usage: data?.items
      // But here in providerClientsApi.ts, we were returning (payload as any).data
      // This suggests payload.data IS the object containing { items: ... }
      
      // However, if we want to return Domain Models, we should probably return the whole structure mapped.
      // But `ClientAdapter.toDomain` maps a single client.
      // Let's assume payload.data has an `items` array.
      
      const dataObj = (payload as any).data;
      if (dataObj && Array.isArray(dataObj.items)) {
        return {
          ...dataObj,
          items: dataObj.items.map(ClientAdapter.toDomain)
        };
      }
      return dataObj;
    }
    return payload;
  },

  async detail(clientId: string): Promise<IClient | null> {
    const res = await http.get(`/providers/clients/${clientId}`);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return ClientAdapter.toDomain((payload as any).data);
    }
    return null;
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

