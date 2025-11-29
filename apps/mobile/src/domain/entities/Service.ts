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
  category: ServiceCategory | null;
  priceCents: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function createService(data: {
  name: string;
  description?: string | null;
  category?: ServiceCategory | null;
  priceCents: number;
  durationMinutes: number;
  isActive?: boolean;
}): Service {
  return {
    id: '', // Will be set by repository
    name: data.name,
    description: data.description ?? null,
    category: data.category ?? null,
    priceCents: data.priceCents,
    durationMinutes: data.durationMinutes,
    isActive: data.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

