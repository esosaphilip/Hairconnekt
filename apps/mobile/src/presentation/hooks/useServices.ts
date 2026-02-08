/**
 * Services Hook
 * Presentation layer - connects UI to domain use cases
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { ServiceUseCases } from '@/domain/usecases/ServiceUseCases';
import { ServiceRepositoryImpl } from '@/data/repositories/ServiceRepositoryImpl';
import type { Service } from '@/domain/entities/Service';
import { DomainError } from '@/domain/errors/DomainError';
import { MESSAGES } from '@/constants';
import { getErrorMessage } from '@/presentation/utils/errorHandler';

// Singleton instance (in real app, use dependency injection container)
const serviceRepository = new ServiceRepositoryImpl();
const defaultServiceUseCases = new ServiceUseCases(serviceRepository);

export function useServices(serviceUseCasesOverride?: any) {
  const serviceUseCases = serviceUseCasesOverride || defaultServiceUseCases;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const isValidUuid = (id?: string) => {
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const valid = uuidRegex.test(id);
    if (!valid && process.env.NODE_ENV === 'development') {
      console.warn(`[useServices] Invalid UUID detected: ${id}`);
    }
    return valid;
  };

  const loadServices = useCallback(async () => {
    console.log('[useServices] loadServices called, user:', user);
    console.log('[useServices] user?.id:', user?.id);
    console.log('[useServices] isValidUuid(user.id):', user?.id ? isValidUuid(user.id) : 'N/A (no user ID)');

    // Guard: Require valid auth user ID
    if (!user?.id || !isValidUuid(user.id)) {
      console.warn('[useServices] Skipping load - Invalid/Missing User ID. user?.id:', user?.id);
      // Clear any previous errors and services to prevent stale state
      setError(null);
      setServices([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('[useServices] Making API call to listServices...');
      // Use 'me' (undefined) to ensure we hit the private /providers/me/services endpoint
      // instead of the public /providers/:id/services endpoint
      const data = await serviceUseCases.listServices();
      console.log('[useServices] listServices returned:', data?.length, 'services');
      setServices(data || []);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('[useServices] Error loading services:', message);
      setError(message || MESSAGES.ERROR.LOAD_FAILED);

    } finally {
      setLoading(false);
    }
  }, [user?.id, serviceUseCases]); // Add serviceUseCases dependency (stable if default, or from prop)

  useEffect(() => {
    loadServices();
  }, [loadServices]); // Trigger load on mount or when auth changes (loadServices depends on user)

  const createService = useCallback(async (data: {
    name: string;
    description?: string | null;
    priceCents: number;
    durationMinutes: number;
    isActive?: boolean;
    allowOnlineBooking?: boolean;
    categoryId?: string;
    tags?: string[];
  }): Promise<Service> => {
    // Guard: Require valid auth user ID
    if (!user?.id || !isValidUuid(user.id)) {
      throw new Error(MESSAGES.ERROR.UNAUTHORIZED || 'Nicht autorisiert (Invalid ID)');
    }

    setLoading(true);
    setError(null);
    // Optimistic update disabled to prevent UI glitch on error
    try {
      const service = await serviceUseCases.createService({
        ...data,
        providerId: undefined // Use 'me' to ensure we hit the private /providers/me/services endpoint
      });
      setServices((prev) => [service, ...prev]);
      return service;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message || MESSAGES.ERROR.SAVE_FAILED);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, serviceUseCases]);

  const updateService = useCallback(async (id: string, data: Partial<Service>): Promise<Service> => {
    // Guard: Require valid auth user ID
    if (!user?.id || !isValidUuid(user.id)) {
      throw new Error(MESSAGES.ERROR.UNAUTHORIZED || 'Nicht autorisiert (Invalid ID)');
    }

    setLoading(true);
    setError(null);
    // Optimistic update disabled to prevent UI glitch on error
    try {
      const service = await serviceUseCases.updateService(id, data);
      setServices((prev) => prev.map((s) => (s.id === id ? service : s)));
      return service;
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message || MESSAGES.ERROR.SAVE_FAILED);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, serviceUseCases]);

  const deleteService = useCallback(async (id: string): Promise<void> => {
    // Guard: Require valid auth user ID
    if (!user?.id || !isValidUuid(user.id)) {
      throw new Error(MESSAGES.ERROR.UNAUTHORIZED || 'Nicht autorisiert (Invalid ID)');
    }

    setLoading(true);
    setError(null);
    const before = services;
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await serviceUseCases.deleteService(id);
    } catch (err: unknown) {
      setServices(before);
      const message = getErrorMessage(err);
      setError(message || MESSAGES.ERROR.DELETE_FAILED);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [services, user?.id, serviceUseCases]);

  const toggleServiceActive = useCallback(async (id: string, isActive: boolean): Promise<Service> => {
    // Guard: Require valid auth user ID
    if (!user?.id || !isValidUuid(user.id)) {
      throw new Error(MESSAGES.ERROR.UNAUTHORIZED || 'Nicht autorisiert (Invalid ID)');
    }

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
      const message = getErrorMessage(err);
      setError(message || MESSAGES.ERROR.SAVE_FAILED);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [services, user?.id, serviceUseCases]);

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
