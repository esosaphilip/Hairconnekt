/**
 * Domain entity: Voucher
 * Pure TypeScript, no external dependencies
 */

export type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseCents: number | null;
  maxDiscountCents: number | null;
  validFrom: Date;
  validUntil: Date;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function createVoucher(data: {
  code: string;
  title: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseCents?: number | null;
  maxDiscountCents?: number | null;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number | null;
  isActive?: boolean;
}): Voucher {
  return {
    id: '', // Will be set by repository
    code: data.code.toUpperCase().trim(),
    title: data.title.trim(),
    description: data.description ?? null,
    discountType: data.discountType,
    discountValue: data.discountValue,
    minPurchaseCents: data.minPurchaseCents ?? null,
    maxDiscountCents: data.maxDiscountCents ?? null,
    validFrom: data.validFrom,
    validUntil: data.validUntil,
    usageLimit: data.usageLimit ?? null,
    usedCount: 0,
    isActive: data.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

