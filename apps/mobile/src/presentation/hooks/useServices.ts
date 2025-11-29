/**
 * Services Hook
 * Presentation layer - connects UI to domain use cases
 */

import { useState, useEffect, useCallback } from 'react';
import { ServiceUseCases } from '@/domain/usecases/ServiceUseCases';
import { ServiceRepositoryImpl } from '@/data/repositories/ServiceRepositoryImpl';
import type { Service } from '@/domain/entities/Service';
import { DomainError } from '@/domain/errors/DomainError';
import { MESSAGES } from '@/constants';

// Singleton instance (in real app, use dependency injection container)
const serviceRepository = new ServiceRepositoryImpl();
const serviceUseCases = new ServiceUseCases(serviceRepository);

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceUseCases.listServices();
      setServices(data);
    } catch (err: unknown) {
      const message = err instanceof DomainError ? err.message : MESSAGES.ERROR.LOAD_FAILED;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const createService = useCallback(async (data: {
    name: string;
    description?: string | null;
    priceCents: number;
    durationMinutes: number;
    isActive?: boolean;
  }): Promise<Service> => {
    setLoading(true);
    setError(null);
    try {
      const service = await serviceUseCases.createService(data);
      await loadServices(); // Refresh list
      return service;
    } catch (err: unknown) {
      const message = err instanceof DomainError ? err.message : MESSAGES.ERROR.SAVE_FAILED;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadServices]);

  const updateService = useCallback(async (id: string, data: Partial<Service>): Promise<Service> => {
    setLoading(true);
    setError(null);
    try {
      const service = await serviceUseCases.updateService(id, data);
      await loadServices(); // Refresh list
      return service;
    } catch (err: unknown) {
      const message = err instanceof DomainError ? err.message : MESSAGES.ERROR.SAVE_FAILED;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadServices]);

  const deleteService = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await serviceUseCases.deleteService(id);
      await loadServices(); // Refresh list
    } catch (err: unknown) {
      const message = err instanceof DomainError ? err.message : MESSAGES.ERROR.DELETE_FAILED;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadServices]);

  const toggleServiceActive = useCallback(async (id: string, isActive: boolean): Promise<Service> => {
    setLoading(true);
    setError(null);
    try {
      const service = await serviceUseCases.toggleServiceActive(id, isActive);
      await loadServices(); // Refresh list
      return service;
    } catch (err: unknown) {
      const message = err instanceof DomainError ? err.message : MESSAGES.ERROR.SAVE_FAILED;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadServices]);

  return {
    services,
    loading,
    error,
    loadServices,
    createService,
    updateService,
    deleteService,
    toggleServiceActive,
  };
}

