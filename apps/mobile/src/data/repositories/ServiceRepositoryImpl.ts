/**
 * Service Repository Implementation
 * Data layer - implements domain interface, handles API calls
 */

import type { IServiceRepository } from '@/domain/repositories/IServiceRepository';
import type { Service } from '@/domain/entities/Service';
import { http } from '@/api/http';
import { createDomainError, ErrorType, mapApiError } from '@/domain/errors/DomainError';

export class ServiceRepositoryImpl implements IServiceRepository {
  async list(providerId?: string): Promise<Service[]> {
    try {
      // Endpoint: GET /providers/:id/services (http client adds base URL /api/v1)
      const id = providerId || 'me';
      const res = await http.get(`/providers/${id}/services`);
      const payload = res?.data;

      // Backend returns direct array of Service objects
      // We prioritize checking for array first to match backend implementation
      const list = Array.isArray(payload)
        ? payload
        : (payload && typeof payload === 'object' && 'data' in payload ? (payload as any).data : []);

      const items: Service[] = list.map((s: any) => ({
        id: String(s.id || s.serviceId),
        name: String(s.name || ''),
        description: s.description ?? null,
        category: s.category && typeof s.category === 'object'
          ? { id: String(s.category.id), nameDe: String(s.category.nameDe || s.category.name || ''), nameEn: String(s.category.nameEn || s.category.name || '') }
          : s.category
            ? { id: String(s.category), nameDe: String(s.category), nameEn: String(s.category) }
            : null,
        priceCents: typeof s.price === 'number' ? Math.round(s.price * 100) : (s.priceCents || 0),
        durationMinutes: typeof s.duration === 'number' ? s.duration : (s.durationMinutes || 60),
        isActive: s.isActive !== undefined ? !!s.isActive : true,
        allowOnlineBooking: s.allowOnlineBooking !== undefined ? !!s.allowOnlineBooking : true,
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
      throw mapApiError(error);
    }
  }

  async create(service: Service, providerId?: string): Promise<Service> {
    try {
      const payload = {
        name: service.name,
        categoryId: (service as any)?.category?.id || (service as any)?.categoryId || null,
        durationMinutes: Number.isInteger(service.durationMinutes) ? service.durationMinutes : parseInt(String(service.durationMinutes || 60), 10),
        priceCents: Number.isInteger(service.priceCents) ? service.priceCents : parseInt(String(service.priceCents || 0), 10),
        priceType: 'FIXED',
        description: service.description ?? null,
        isActive: Boolean(service.isActive ?? true),
        allowOnlineBooking: Boolean((service as any)?.allowOnlineBooking ?? true),
      };

      console.log('[ServiceRepo] CREATE Payload:', JSON.stringify(payload, null, 2));

      // Endpoint: POST /providers/:id/services (http client adds base URL /api/v1)
      const id = providerId || 'me';
      const res = await http.post(`/providers/${id}/services`, payload);
      const s = (res?.data && (res.data as any).data) ? (res.data as any).data : (res?.data ?? {});

      const mapped: Service = {
        id: String(s.serviceId || s.id),
        name: String(s.name || service.name || ''),
        description: s.description ?? null,
        category: payload.categoryId ? { id: String(payload.categoryId), nameDe: 'Category', nameEn: 'Category' } : null,
        priceCents: Math.round(((s.priceCents as number) ?? payload.priceCents as number)),
        durationMinutes: Number((s.durationMinutes as number) ?? payload.durationMinutes as number),
        isActive: typeof s.isActive === 'boolean' ? s.isActive : !!payload.isActive,
        allowOnlineBooking: typeof s.allowOnlineBooking === 'boolean' ? s.allowOnlineBooking : !!payload.allowOnlineBooking,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return mapped;
    } catch (error: unknown) {
      console.log('Create Service Error:', JSON.stringify((error as any)?.response?.data));
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message;
      if (status === 400) throw new Error(message || 'Ungültige Daten');
      if (status === 401) throw new Error('Nicht autorisiert. Bitte erneut anmelden.');
      if (status === 500) throw new Error('Serverfehler. Bitte versuche es später erneut.');
      throw new Error(message || 'Netzwerkfehler. Überprüfe deine Internetverbindung.');
    }
  }

  async update(id: string, service: Partial<Service>): Promise<Service> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw createDomainError(ErrorType.NOT_FOUND, `Service with id ${id} not found`);
      }

      // STRICT CONTRACT: Payload Construction
      const body: any = {};
      if (service.name !== undefined) body.name = service.name;
      if (service.description !== undefined) body.description = service.description;
      if (service.priceCents !== undefined) {
        body.priceCents = Number.isInteger(service.priceCents) ? service.priceCents : parseInt(String(service.priceCents), 10);
      }
      if (service.durationMinutes !== undefined) {
        body.durationMinutes = Number.isInteger(service.durationMinutes) ? service.durationMinutes : parseInt(String(service.durationMinutes), 10);
      }
      if ((service as any)?.category?.id || (service as any)?.categoryId) {
        body.categoryId = (service as any)?.category?.id || (service as any)?.categoryId;
      }
      if (service.isActive !== undefined) body.isActive = Boolean(service.isActive);
      if ((service as any)?.allowOnlineBooking !== undefined) {
        body.allowOnlineBooking = Boolean((service as any).allowOnlineBooking);
      }

      console.log('[ServiceRepo] UPDATE Request URL:', `/providers/me/services/${id}`);
      console.log('[ServiceRepo] UPDATE Payload:', JSON.stringify(body, null, 2));

      // Endpoint: PATCH /providers/me/services/:id (http client appends to base URL /api/v1)
      const res = await http.patch(`/providers/me/services/${id}`, body);
      const s = (res?.data && (res.data as any).data) ? (res.data as any).data : (res?.data ?? {});

      const mapped: Service = {
        id: String(s.serviceId || id),
        name: String(s.name || existing.name || ''),
        description: s.description ?? null,
        category: body.categoryId ? { id: String(body.categoryId), nameDe: 'Category', nameEn: 'Category' } : null,
        priceCents: Math.round(((s.priceCents as number) ?? body.priceCents as number ?? existing.priceCents)),
        durationMinutes: Number((s.durationMinutes as number) ?? body.durationMinutes as number ?? existing.durationMinutes),
        isActive: typeof s.isActive === 'boolean' ? s.isActive : !!body.isActive,
        allowOnlineBooking: typeof s.allowOnlineBooking === 'boolean' ? s.allowOnlineBooking : !!(body.allowOnlineBooking ?? existing.allowOnlineBooking),
        createdAt: existing.createdAt,
        updatedAt: new Date(),
      };
      return mapped;
    } catch (error: unknown) {
      if ((error as any)?.type === ErrorType.NOT_FOUND) throw error;
      // ERROR HANDLING: Log exact URL and Payload
      console.log(`[ServiceRepo] Update Error: PATCH /providers/me/services/${id}`);
      console.log('[ServiceRepo] Payload:', JSON.stringify(service));
      console.log('[ServiceRepo] Response:', JSON.stringify((error as any)?.response?.data));

      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message;
      if (status === 400) throw new Error(message || 'Ungültige Daten');
      if (status === 401) throw new Error('Nicht autorisiert. Bitte erneut anmelden.');
      if (status === 404) throw new Error('Service nicht gefunden');
      if (status === 500) throw new Error('Serverfehler. Bitte versuche es später erneut.');
      throw new Error(message || 'Netzwerkfehler. Überprüfe deine Internetverbindung.');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Endpoint: DELETE /providers/me/services/:id (http client appends to base URL /api/v1)
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
      // Endpoint: PATCH /providers/me/services/:id (http client appends to base URL /api/v1)
      const res = await http.patch(`/providers/me/services/${id}`, { isActive });
      const s = (res?.data && (res.data as any).data) ? (res.data as any).data : (res?.data ?? {});
      const updated = await this.getById(id);
      if (!updated) throw createDomainError(ErrorType.NOT_FOUND, `Service with id ${id} not found`);
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
