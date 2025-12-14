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
      // Use the correct endpoint as defined in API_CONFIG (/services/provider)
      const res = await http.get('/services/provider');
      const payload = res?.data;
      // Backend returns { success: true, data: [ ... ] } or just [ ... ]
      const list = payload && typeof payload === 'object' && 'success' in payload && 'data' in payload
        ? (payload as any).data
        : (Array.isArray(payload) ? payload : (payload?.items ?? payload?.services ?? []));

      const items: Service[] = (Array.isArray(list) ? list : []).map((s: any) => ({
        id: String(s.id || s.serviceId),
        name: String(s.name || ''),
        description: s.description ?? null,
        category: s.category ? { id: String(s.category), nameDe: String(s.category), nameEn: String(s.category) } : null,
        priceCents: typeof s.price === 'number' ? Math.round(s.price * 100) : 0,
        durationMinutes: typeof s.duration === 'number' ? s.duration : 60,
        isActive: s.isActive !== undefined ? !!s.isActive : true,
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
      }));
      return items;
    } catch (error: unknown) {
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message;
      if (status === 401) throw new Error('Nicht autorisiert. Bitte erneut anmelden.');
      if (status === 500) throw new Error('Serverfehler. Bitte versuche es später erneut.');
      throw new Error(message || 'Failed to fetch services');
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
      const payload = {
        name: service.name,
        categoryId: (service as any)?.category?.id || (service as any)?.categoryId, // Prefer ID
        durationMinutes: Number(service.durationMinutes || 0),
        priceCents: (service.priceCents || 0),
        priceType: 'FIXED',
        description: service.description ?? undefined,
        isActive: service.isActive !== undefined ? !!service.isActive : true,
      };
      // Correct endpoint: POST /services
      const res = await http.post('/services', payload);
      const s = (res?.data && (res.data as any).data) ? (res.data as any).data : (res?.data ?? {});
      const mapped: Service = {
        id: String(s.serviceId || s.id),
        name: String(s.name || service.name || ''),
        description: s.description ?? null,
        category: payload.categoryId ? { id: String(payload.categoryId), nameDe: 'Category', nameEn: 'Category' } : null,
        priceCents: Math.round(((s.priceCents as number) ?? payload.priceCents as number)),
        durationMinutes: Number((s.durationMinutes as number) ?? payload.durationMinutes as number),
        isActive: typeof s.isActive === 'boolean' ? s.isActive : !!payload.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return mapped;
    } catch (error: unknown) {
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message;
      if (status === 400) throw new Error(message || 'Ungültige Daten');
      if (status === 401) throw new Error('Nicht autorisiert. Bitte erneut anmelden.');
      if (status === 500) throw new Error('Serverfehler. Bitte versuche es später erneut.');
      throw new Error('Netzwerkfehler. Überprüfe deine Internetverbindung.');
    }
  }

  async update(id: string, service: Partial<Service>): Promise<Service> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new NotFoundError('Service', id);
      }
      const body: any = {
        name: service.name,
        categoryId: (service as any)?.category?.id || (service as any)?.categoryId,
        durationMinutes: service.durationMinutes != null ? Number(service.durationMinutes) : undefined,
        priceCents: service.priceCents != null ? Number(service.priceCents) : undefined,
        description: service.description,
        isActive: service.isActive,
      };
      // Correct endpoint: PATCH /services/:id
      const res = await http.patch(`/services/${id}`, body);
      const s = (res?.data && (res.data as any).data) ? (res.data as any).data : (res?.data ?? {});
      const mapped: Service = {
        id: String(s.serviceId || id),
        name: String(s.name || existing.name || ''),
        description: s.description ?? null,
        category: body.categoryId ? { id: String(body.categoryId), nameDe: 'Category', nameEn: 'Category' } : null,
        priceCents: Math.round(((s.priceCents as number) ?? body.priceCents as number ?? existing.priceCents)),
        durationMinutes: Number((s.durationMinutes as number) ?? body.durationMinutes as number ?? existing.durationMinutes),
        isActive: typeof s.isActive === 'boolean' ? s.isActive : !!body.isActive,
        createdAt: existing.createdAt,
        updatedAt: new Date(),
      };
      return mapped;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) throw error;
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message;
      if (status === 400) throw new Error(message || 'Ungültige Daten');
      if (status === 401) throw new Error('Nicht autorisiert. Bitte erneut anmelden.');
      if (status === 500) throw new Error('Serverfehler. Bitte versuche es später erneut.');
      throw new Error('Netzwerkfehler. Überprüfe deine Internetverbindung.');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Correct endpoint: DELETE /services/:id
      await http.delete(`/services/${id}`);
      return;
    } catch (error: unknown) {
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message;
      if (status === 400) throw new Error(message || 'Ungültige Daten');
      if (status === 401) throw new Error('Nicht autorisiert. Bitte erneut anmelden.');
      if (status === 500) throw new Error('Serverfehler. Bitte versuche es später erneut.');
      throw new Error('Netzwerkfehler. Überprüfe deine Internetverbindung.');
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<Service> {
    try {
      // Correct endpoint: PATCH /services/:id
      const res = await http.patch(`/services/${id}`, { isActive });
      const s = (res?.data && (res.data as any).data) ? (res.data as any).data : (res?.data ?? {});
      const updated = await this.getById(id);
      if (!updated) throw new NotFoundError('Service', id);
      return { ...updated, isActive: !!(s?.isActive ?? isActive) };
    } catch (error: unknown) {
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message;
      if (status === 400) throw new Error(message || 'Ungültige Daten');
      if (status === 401) throw new Error('Nicht autorisiert. Bitte erneut anmelden.');
      if (status === 500) throw new Error('Serverfehler. Bitte versuche es später erneut.');
      throw new Error('Netzwerkfehler. Überprüfe deine Internetverbindung.');
    }
  }
}
