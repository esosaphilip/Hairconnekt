/**
 * Service Repository Interface
 * Domain layer - defines contract, no implementation
 */

import type { Service } from '../entities/Service';

export interface IServiceRepository {
  list(providerId?: string): Promise<Service[]>;
  getById(id: string): Promise<Service | null>;
  create(service: Service, providerId?: string): Promise<Service>;
  update(id: string, service: Partial<Service>): Promise<Service>;
  delete(id: string): Promise<void>;
  toggleActive(id: string, isActive: boolean): Promise<Service>;
}

