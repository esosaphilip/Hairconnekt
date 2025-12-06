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
    const temp: Service = {
      id: `temp_${Date.now()}`,
      name: data.name,
      description: data.description ?? null,
      category: null,
      priceCents: data.priceCents,
      durationMinutes: data.durationMinutes,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setServices((prev) => [temp, ...prev]);
    try {
      const service = await serviceUseCases.createService(data);
      setServices((prev) => [service, ...prev.filter((s) => s.id !== temp.id)]);
      return service;
    } catch (err: unknown) {
      setServices((prev) => prev.filter((s) => s.id !== temp.id));
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
    const before = services;
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date() } : s)));
    try {
      const service = await serviceUseCases.updateService(id, data);
      setServices((prev) => prev.map((s) => (s.id === id ? service : s)));
      return service;
    } catch (err: unknown) {
      setServices(before);
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
    const before = services;
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await serviceUseCases.deleteService(id);
    } catch (err: unknown) {
      setServices(before);
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
    const before = services;
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
    try {
      const service = await serviceUseCases.toggleServiceActive(id, isActive);
      setServices((prev) => prev.map((s) => (s.id === id ? service : s)));
      return service;
    } catch (err: unknown) {
      setServices(before);
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
