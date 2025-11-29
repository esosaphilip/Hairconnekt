import { http } from './http';

export type ProviderVoucherStatus = 'active' | 'expired' | 'used';

export type ProviderVoucher = {
  id: string;
  code: string;
  title?: string;
  description?: string;
  discount: string; // e.g. "10%" or "€5"
  minAmount?: number;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
  usedCount?: number;
  revenueCents?: number;
  status?: ProviderVoucherStatus;
};

export type ListProviderVouchersResponse = {
  items: ProviderVoucher[];
};

export const providerVouchersApi = {
  async list(status?: ProviderVoucherStatus): Promise<ListProviderVouchersResponse> {
    // Prefer provider-specific endpoint if available; otherwise fall back to public vouchers list
    try {
      const res = await http.get('/providers/vouchers', { params: { status } });
      return res.data as ListProviderVouchersResponse;
    } catch {
      // Fallback: use consumer vouchers endpoint and adapt structure
      const res = await http.get('/vouchers', { params: { status: status === 'used' ? 'used' : 'active' } });
      type ConsumerVoucher = {
        id: string;
        code: string;
        title?: string;
        description?: string;
        discount: string;
        minAmount?: number;
        expiresAt?: string;
        usedAt?: string;
      };
      const raw = (res.data?.items || []) as ConsumerVoucher[];
      const items: ProviderVoucher[] = raw.map((v) => ({
        id: v.id,
        code: v.code,
        title: v.title,
        description: v.description,
        discount: v.discount,
        minAmount: v.minAmount,
        expiresAt: v.expiresAt ?? v.usedAt,
        status: status ?? (v.usedAt ? 'used' : 'active'),
      }));
      return { items };
    }
  },
};
