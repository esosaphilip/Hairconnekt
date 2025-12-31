/**
 * Domain entity: Service
 * Pure TypeScript, no external dependencies
 */

export type ServiceCategory = {
  id: string;
  nameDe: string;
  nameEn: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  category?: ServiceCategory | null; // Renamed/Deprecated in favor of categoryId
  categoryId?: string | null;
  tags?: string[];
  priceCents: number;
  durationMinutes: number;
  isActive: boolean;
  allowOnlineBooking: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function createService(data: {
  name: string;
  description?: string | null;
  category?: ServiceCategory | null;
  categoryId?: string | null;
  tags?: string[];
  priceCents: number;
  durationMinutes: number;
  isActive?: boolean;
  allowOnlineBooking?: boolean;
}): Service {
  return {
    id: '', // Will be set by repository
    name: data.name,
    description: data.description ?? null,
    category: data.category ?? null,
    categoryId: data.categoryId ?? null,
    tags: data.tags ?? [],
    priceCents: data.priceCents,
    durationMinutes: data.durationMinutes,
    isActive: data.isActive ?? true,
    allowOnlineBooking: data.allowOnlineBooking ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

