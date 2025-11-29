import { http } from '../api/http';

export type BackendActiveVoucher = {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  minAmount: number;
  expiresAt: string;
  applicableTo: string;
};

export type BackendUsedVoucher = {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  usedAt: string;
  savedAmount: string;
};

export const vouchersApi = {
  async list(status: 'active' | 'used'): Promise<{ items: (BackendActiveVoucher | BackendUsedVoucher)[] }> {
    const res = await http.get('/vouchers', { params: { status } });
    return res.data as { items: (BackendActiveVoucher | BackendUsedVoucher)[] };
  },
  async redeem(code: string): Promise<{ success: boolean }> {
    const res = await http.post('/vouchers/redeem', { code });
    return res.data as { success: boolean };
  }
};
