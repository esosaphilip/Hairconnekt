import { http } from './http';

export type ProviderVoucherStatus = 'all' | 'active' | 'inactive' | 'expired' | 'used';

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
  pagination?: { page: number; limit: number; total: number; totalPages: number };
};

export const providerVouchersApi = {
  async list(params: { status?: 'all' | 'active' | 'inactive' | 'expired'; page?: number; limit?: number } = {}): Promise<ListProviderVouchersResponse> {
    const res = await http.get('/providers/me/vouchers', { params });
    const payload = res?.data;
    let data = payload;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      data = (payload as any).data;
    }
    const vouchers = Array.isArray((data as any)?.vouchers) ? (data as any).vouchers : ((data as any)?.items ?? []);
    const items: ProviderVoucher[] = vouchers.map((v: any) => {
      const type = String(v.type || 'percentage');
      const dv = Number(v.discountValue || 0);
      const discount = type === 'percentage' ? `${dv}%` : type === 'fixed_amount' ? `€${dv}` : '0';
      const startsAt = v.validFrom || v.startsAt;
      const expiresAt = v.validUntil || v.expiresAt;
      const isActive = !!v.isActive;
      const status: ProviderVoucherStatus = isActive ? 'active' : 'inactive';
      const minAmount = v.conditions?.minimumPurchase ?? v.minAmount;
      const usageLimit = v.usageLimits?.totalUses ?? v.usageLimit;
      const usedCount = v.usageLimits?.currentUses ?? v.usedCount;
      return {
        id: String(v.id),
        code: String(v.code || ''),
        title: v.title,
        description: v.description,
        discount,
        minAmount: typeof minAmount === 'number' ? minAmount : undefined,
        startsAt,
        expiresAt,
        usageLimit: typeof usageLimit === 'number' ? usageLimit : undefined,
        usedCount: typeof usedCount === 'number' ? usedCount : undefined,
        revenueCents: (v.totalRevenueCents ?? undefined),
        status,
      };
    });
    const pagination = (data as any)?.pagination;
    return { items, pagination };
  },

  async create(body: { code: string; type: 'percentage' | 'fixed_amount' | 'free_service'; discountValue?: number; maxDiscount?: number; freeServiceId?: string; description: string; validFrom: string; validUntil: string; usageLimits: { totalUses: number; usesPerClient: number }; conditions?: { minimumPurchase?: number; applicableServiceIds?: string[]; newClientsOnly?: boolean } }) {
    const res = await http.post('/providers/me/vouchers', body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async update(voucherId: string, body: { code: string; type: 'percentage' | 'fixed_amount' | 'free_service'; discountValue?: number; maxDiscount?: number; freeServiceId?: string; description: string; validFrom: string; validUntil: string; usageLimits: { totalUses: number; usesPerClient: number }; conditions?: { minimumPurchase?: number; applicableServiceIds?: string[]; newClientsOnly?: boolean } }) {
    const res = await http.put(`/providers/me/vouchers/${voucherId}`, body);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async toggle(voucherId: string, isActive: boolean) {
    const res = await http.patch(`/providers/me/vouchers/${voucherId}/toggle`, { isActive });
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },

  async remove(id: string) {
    const res = await http.delete(`/providers/me/vouchers/${id}`);
    return res?.data;
  },

  async stats(voucherId: string) {
    const res = await http.get(`/providers/me/vouchers/${voucherId}/stats`);
    const payload = res?.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return (payload as any).data;
    }
    return payload;
  },
};
