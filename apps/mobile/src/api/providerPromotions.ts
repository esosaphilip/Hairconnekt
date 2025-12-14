import { http } from './http';

export const providerPromotionsApi = {
  async sendPromotional(body: { clientIds: string[]; message: string; voucherCode?: string }) {
    const res = await http.post('/providers/messages/promotional', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};

