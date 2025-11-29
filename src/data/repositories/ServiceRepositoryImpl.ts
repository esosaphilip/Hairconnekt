/**
 * Service Repository Implementation
 * Data layer - implements domain interface, handles API calls
 */

import type { IServiceRepository } from '@/domain/repositories/IServiceRepository';
import type { Service } from '@/domain/entities/Service';
import { http } from '@/api/http';
import { API_CONFIG } from '@/constants';
import { mapServiceDTOToEntity, mapServiceEntityToDTO } from '../mappers/ServiceMapper';
import type { ServiceDTO } from '../dto/ServiceDTO';
import { NetworkError, NotFoundError } from '@/domain/errors/DomainError';

export class ServiceRepositoryImpl implements IServiceRepository {
  async list(): Promise<Service[]> {
    try {
      const res = await http.get<{ items: ServiceDTO[] } | ServiceDTO[]>(API_CONFIG.ENDPOINTS.SERVICES.LIST);
      const items = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
      return items.map(mapServiceDTOToEntity);
    } catch (error: unknown) {
      throw new NetworkError('Failed to fetch services', { originalError: error });
    }
  }

  async getById(id: string): Promise<Service | null> {
    try {
      const services = await this.list();
      return services.find(s => s.id === id) ?? null;
    } catch (error: unknown) {
      throw new NetworkError('Failed to fetch service', { originalError: error });
    }
  }

  async create(service: Service): Promise<Service> {
    try {
      const dto = mapServiceEntityToDTO(service);
      const res = await http.post<ServiceDTO>(API_CONFIG.ENDPOINTS.SERVICES.CREATE, dto);
      return mapServiceDTOToEntity(res.data);
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

      const updated: Service = { ...existing, ...service, updatedAt: new Date() };
      const dto = mapServiceEntityToDTO(updated);
      const res = await http.patch<ServiceDTO>(API_CONFIG.ENDPOINTS.SERVICES.UPDATE(id), dto);
      return mapServiceDTOToEntity(res.data);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) throw error;
      throw new NetworkError('Failed to update service', { originalError: error });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await http.delete(API_CONFIG.ENDPOINTS.SERVICES.DELETE(id));
    } catch (error: unknown) {
      throw new NetworkError('Failed to delete service', { originalError: error });
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<Service> {
    return this.update(id, { isActive });
  }
}

