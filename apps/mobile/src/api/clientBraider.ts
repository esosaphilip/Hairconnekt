import { http } from './http';
import { API_CONFIG } from '@/constants';
import { IBraider } from '../domain/models/braider';
import { BraiderAdapter } from './adapters/braiderAdapter';
import { mapApiError } from '../domain/errors/DomainError';

export const clientBraiderApi = {
  async getNearby(params: { lat: number; lon: number; radiusKm?: number; limit?: number }): Promise<IBraider[]> {
    try {
      const res = await http.get<{ items: any[] }>(API_CONFIG.ENDPOINTS.PROVIDERS.NEARBY, { params });
      const items = res.data?.items ?? [];
      return items.map(BraiderAdapter.toDomain);
    } catch (error) {
      throw mapApiError(error);
    }
  },

  async search(
    term: string,
    filters: { category?: string; sortBy?: string; providerTypes?: string[]; priceRanges?: number[]; rating?: number } = {},
  ): Promise<IBraider[]> {
    try {
      // Use the dedicated SearchController
      const res = await http.get('/search', { params: { q: term, ...filters } });
      const items = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []);
      return items.map(BraiderAdapter.toDomain);
    } catch (error) {
      throw mapApiError(error);
    }
  },

  async searchByCategory(slug: string): Promise<IBraider[]> {
    try {
      const res = await http.get(`/search/category/${slug}`);
      const items = Array.isArray(res.data?.results) ? res.data.results : [];
      return items.map(BraiderAdapter.toDomain);
    } catch (error) {
      throw mapApiError(error);
    }
  },

  async getProfile(id: string): Promise<IBraider> {
    try {
      const res = await http.get(`/providers/${id}`);
      const data = res.data;
      return BraiderAdapter.toDomainProfile(data);
    } catch (error) {
      throw mapApiError(error);
    }
  }
};
