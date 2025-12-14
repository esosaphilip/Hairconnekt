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
      const res = await http.get('/providers/me/services');
      const payload = res?.data;
      const list = payload && typeof payload === 'object' && 'success' in payload && 'data' in payload
        ? (payload as any).data?.services ?? []
        : (Array.isArray(payload) ? payload : (payload?.items ?? payload?.services ?? []));
      const items: Service[] = (Array.isArray(list) ? list : []).map((s: any) => ({
        id: String(s.id),
        name: String(s.name || ''),
        description: s.description ?? null,
        category: s.category ? { id: String(s.category), nameDe: String(s.category), nameEn: String(s.category) } : null,
        priceCents: typeof s.price === 'number' ? Math.round(s.price * 100) : 0,
        durationMinutes: typeof s.duration === 'number' ? s.duration : 60,
        isActive: !!s.isActive,
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
        category: (service as any)?.categoryName || (service as any)?.category?.nameDe || (service as any)?.category?.name || '',
        duration: Number(service.durationMinutes || 0),
        durationUnit: 'fixed',
        price: (service.priceCents || 0) / 100,
        priceType: 'fixed',
        description: service.description ?? undefined,
        isActive: !!service.isActive,
      } as Record<string, unknown>;
      const res = await http.post('/providers/me/services', payload);
      const s = (res?.data && (res.data as any).data) ? (res.data as any).data : (res?.data ?? {});
      const mapped: Service = {
        id: String(s.serviceId || s.id),
        name: String(s.name || service.name || ''),
        description: s.description ?? null,
        category: payload.category ? { id: String(payload.category), nameDe: String(payload.category), nameEn: String(payload.category) } : null,
        priceCents: Math.round(((s.price as number) ?? payload.price as number) * 100),
        durationMinutes: Number((s.duration as number) ?? payload.duration as number),
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
        category: (service as any)?.categoryName || (service as any)?.category?.nameDe,
        duration: service.durationMinutes != null ? Number(service.durationMinutes) : undefined,
        durationUnit: 'fixed',
        price: service.priceCents != null ? Number(service.priceCents) / 100 : undefined,
        priceType: 'fixed',
        description: service.description,
        isActive: service.isActive,
      };
      const res = await http.put(`/providers/me/services/${id}`, body);
      const s = (res?.data && (res.data as any).data) ? (res.data as any).data : (res?.data ?? {});
      const mapped: Service = {
        id: String(s.serviceId || id),
        name: String(s.name || existing.name || ''),
        description: s.description ?? null,
        category: body.category ? { id: String(body.category), nameDe: String(body.category), nameEn: String(body.category) } : null,
        priceCents: Math.round(((s.price as number) ?? body.price as number ?? 0) * 100),
        durationMinutes: Number((s.duration as number) ?? body.duration as number ?? existing.durationMinutes),
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
      await http.delete(`/providers/me/services/${id}`);
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
      const res = await http.patch(`/providers/me/services/${id}/toggle-active`, { isActive });
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
