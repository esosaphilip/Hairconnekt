/**
 * Service Mapper
 * Data layer - converts DTO to Domain Entity
 */

import type { Service, ServiceCategory } from '@/domain/entities/Service';
import type { ServiceDTO, ServiceCategoryDTO } from '../dto/ServiceDTO';

export function mapCategoryDTOToEntity(dto: ServiceCategoryDTO | null): ServiceCategory | null {
  if (!dto) return null;
  return {
    id: dto.id,
    nameDe: dto.name_de,
    nameEn: dto.name_en,
  };
}

export function mapServiceDTOToEntity(dto: ServiceDTO): Service {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description,
    category: mapCategoryDTOToEntity(dto.category),
    priceCents: dto.price_cents,
    durationMinutes: dto.duration_minutes,
    isActive: dto.is_active,
    allowOnlineBooking: true, // Default for now as DTO relies on is_active
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function mapServiceEntityToDTO(entity: Service): ServiceDTO {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    category: entity.category ? {
      id: entity.category.id,
      name_de: entity.category.nameDe,
      name_en: entity.category.nameEn,
    } : null,
    price_cents: entity.priceCents,
    duration_minutes: entity.durationMinutes,
    is_active: entity.isActive,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}

