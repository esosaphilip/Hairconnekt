/**
 * Service Use Cases
 * Domain layer - business logic, uses repository interfaces
 */

import type { IServiceRepository } from '../repositories/IServiceRepository';
import type { Service } from '../entities/Service';
import { ValidationError, NotFoundError } from '../errors/DomainError';
import { VALIDATION_RULES } from '@/constants';

export class ServiceUseCases {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async listServices(): Promise<Service[]> {
    return this.serviceRepository.list();
  }

  async getService(id: string): Promise<Service> {
    const service = await this.serviceRepository.getById(id);
    if (!service) {
      throw new NotFoundError('Service', id);
    }
    return service;
  }

  async createService(data: {
    name: string;
    description?: string | null;
    priceCents: number;
    durationMinutes: number;
    isActive?: boolean;
    categoryId?: string;
  }): Promise<Service> {
    // Validation
    if (!data.name || data.name.trim().length < VALIDATION_RULES.SERVICE.NAME_MIN_LENGTH) {
      throw new ValidationError('Service name is required and must be at least 3 characters');
    }

    if (data.priceCents < VALIDATION_RULES.SERVICE.PRICE_MIN || data.priceCents > VALIDATION_RULES.SERVICE.PRICE_MAX) {
      throw new ValidationError(`Price must be between ${VALIDATION_RULES.SERVICE.PRICE_MIN} and ${VALIDATION_RULES.SERVICE.PRICE_MAX} cents`);
    }

    if (data.durationMinutes < VALIDATION_RULES.SERVICE.DURATION_MIN || data.durationMinutes > VALIDATION_RULES.SERVICE.DURATION_MAX) {
      throw new ValidationError(`Duration must be between ${VALIDATION_RULES.SERVICE.DURATION_MIN} and ${VALIDATION_RULES.SERVICE.DURATION_MAX} minutes`);
    }

    const service: Service = {
      id: '',
      name: data.name.trim(),
      description: data.description?.trim() ?? null,
      category: data.categoryId ? ({ id: data.categoryId } as any) : null,
      priceCents: data.priceCents,
      durationMinutes: data.durationMinutes,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.serviceRepository.create(service);
  }

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    await this.getService(id); // Throws if not found

    if (data.name !== undefined && data.name.trim().length < VALIDATION_RULES.SERVICE.NAME_MIN_LENGTH) {
      throw new ValidationError('Service name must be at least 3 characters');
    }

    if (data.priceCents !== undefined) {
      if (data.priceCents < VALIDATION_RULES.SERVICE.PRICE_MIN || data.priceCents > VALIDATION_RULES.SERVICE.PRICE_MAX) {
        throw new ValidationError(`Price must be between ${VALIDATION_RULES.SERVICE.PRICE_MIN} and ${VALIDATION_RULES.SERVICE.PRICE_MAX} cents`);
      }
    }

    if (data.durationMinutes !== undefined) {
      if (data.durationMinutes < VALIDATION_RULES.SERVICE.DURATION_MIN || data.durationMinutes > VALIDATION_RULES.SERVICE.DURATION_MAX) {
        throw new ValidationError(`Duration must be between ${VALIDATION_RULES.SERVICE.DURATION_MIN} and ${VALIDATION_RULES.SERVICE.DURATION_MAX} minutes`);
      }
    }

    return this.serviceRepository.update(id, data);
  }

  async deleteService(id: string): Promise<void> {
    await this.getService(id); // Throws if not found
    return this.serviceRepository.delete(id);
  }

  async toggleServiceActive(id: string, isActive: boolean): Promise<Service> {
    return this.serviceRepository.toggleActive(id, isActive);
  }
}
