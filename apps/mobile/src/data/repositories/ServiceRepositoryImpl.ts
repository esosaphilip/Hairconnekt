/**
 * Service Repository Implementation
 * Data layer - implements domain interface, handles API calls
 */

import type { IServiceRepository } from '@/domain/repositories/IServiceRepository';
import type { Service } from '@/domain/entities/Service';
import { http } from '@/api/http';
import { API_CONFIG } from '@/constants';
import { NetworkError, NotFoundError } from '@/domain/errors/DomainError';
import { providersApi } from '@/services/providers';

export class ServiceRepositoryImpl implements IServiceRepository {
  async list(): Promise<Service[]> {
    try {
      const res = await http.get(API_CONFIG.ENDPOINTS.SERVICES.LIST);
      const raw = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
      const items: Service[] = (raw as any[]).map((s) => ({
        id: String(s.id),
        name: String(s.name || ''),
        description: s.description ?? null,
        category: s.category
          ? { id: String(s.category.id), nameDe: s.category.nameDe ?? s.category.name_de, nameEn: s.category.nameEn ?? s.category.name_en }
          : null,
        priceCents: typeof s.priceCents === 'number' ? s.priceCents : (typeof s.price_cents === 'number' ? s.price_cents : 0),
        durationMinutes: typeof s.durationMinutes === 'number' ? s.durationMinutes : (typeof s.duration_minutes === 'number' ? s.duration_minutes : 60),
        isActive: !!(s.isActive ?? s.is_active),
        createdAt: s.createdAt ? new Date(s.createdAt) : (s.created_at ? new Date(s.created_at) : new Date()),
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : (s.updated_at ? new Date(s.updated_at) : new Date()),
      }));
      return items;
    } catch (error: unknown) {
      throw new NetworkError('Failed to fetch services', { originalError: error });
    }
  }

  async getById(id: string): Promise<Service | null> {
    try {
      const services = await this.list();
      return services.find((s) => s.id === id) ?? null;
    } catch (error: unknown) {
      throw new NetworkError('Failed to fetch service', { originalError: error });
    }
  }

  async create(service: Service): Promise<Service> {
    try {
      const profile: any = await providersApi.getMyProfile();
      const providerId = profile?.id || profile?.provider?.id;
      const payload = {
        provider_id: String(providerId || ''),
        category_id: (service as any)?.categoryId || (service as any)?.category?.id || undefined,
        name: service.name,
        description: service.description ?? undefined,
        price_cents: Number(service.priceCents || 0),
        duration_minutes: Number(service.durationMinutes || 0),
        is_active: !!service.isActive,
      } as Record<string, unknown>;
      const res = await http.post(API_CONFIG.ENDPOINTS.SERVICES.CREATE, payload);
      const s = res.data as any;
      const mapped: Service = {
        id: String(s.id),
        name: String(s.name || ''),
        description: s.description ?? null,
        category: s.category
          ? { id: String(s.category.id), nameDe: s.category.nameDe ?? s.category.name_de, nameEn: s.category.nameEn ?? s.category.name_en }
          : null,
        priceCents: typeof s.priceCents === 'number' ? s.priceCents : (typeof s.price_cents === 'number' ? s.price_cents : 0),
        durationMinutes: typeof s.durationMinutes === 'number' ? s.durationMinutes : (typeof s.duration_minutes === 'number' ? s.duration_minutes : 60),
        isActive: !!(s.isActive ?? s.is_active),
        createdAt: s.createdAt ? new Date(s.createdAt) : (s.created_at ? new Date(s.created_at) : new Date()),
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : (s.updated_at ? new Date(s.updated_at) : new Date()),
      };
      return mapped;
    } catch (error: unknown) {
      throw new NetworkError('Failed to create service', { originalError: error });
    }
  }

  async update(id: string, service: Partial<Service>): Promise<Service> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new NotFoundError('Service', id);
      }
      const patch: any = {
        name: service.name,
        description: service.description,
        price_cents: service.priceCents != null ? Number(service.priceCents) : undefined,
        duration_minutes: service.durationMinutes != null ? Number(service.durationMinutes) : undefined,
        is_active: service.isActive,
      };
      let res: any;
      try {
        res = await http.patch(API_CONFIG.ENDPOINTS.SERVICES.UPDATE(id), patch);
      } catch {
        try {
          res = await http.put(API_CONFIG.ENDPOINTS.SERVICES.UPDATE(id), patch);
        } catch {
          try {
            res = await http.post(API_CONFIG.ENDPOINTS.SERVICES.UPDATE(id), patch);
          } catch {
            // Provider-specific fallback paths
            try {
              res = await http.patch(`/providers/services/${id}`, patch);
            } catch {
              try {
                res = await http.put(`/providers/services/${id}`, patch);
              } catch (e) {
                throw e;
              }
            }
          }
        }
      }
      const s = res.data as any;
      const mapped: Service = {
        id: String(s.id),
        name: String(s.name || ''),
        description: s.description ?? null,
        category: s.category
          ? { id: String(s.category.id), nameDe: s.category.nameDe ?? s.category.name_de, nameEn: s.category.nameEn ?? s.category.name_en }
          : null,
        priceCents: typeof s.priceCents === 'number' ? s.priceCents : (typeof s.price_cents === 'number' ? s.price_cents : 0),
        durationMinutes: typeof s.durationMinutes === 'number' ? s.durationMinutes : (typeof s.duration_minutes === 'number' ? s.duration_minutes : 60),
        isActive: !!(s.isActive ?? s.is_active),
        createdAt: s.createdAt ? new Date(s.createdAt) : (s.created_at ? new Date(s.created_at) : new Date()),
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : (s.updated_at ? new Date(s.updated_at) : new Date()),
      };
      return mapped;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) throw error;
      throw new NetworkError('Failed to update service', { originalError: error });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await http.delete(API_CONFIG.ENDPOINTS.SERVICES.DELETE(id));
      return;
    } catch {}
    try {
      await http.delete(`/providers/services/${id}`);
      return;
    } catch {}
    try {
      await http.post(`/services/delete`, { id });
      return;
    } catch (error: unknown) {
      throw new NetworkError('Failed to delete service', { originalError: error });
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<Service> {
    return this.update(id, { isActive });
  }
}
