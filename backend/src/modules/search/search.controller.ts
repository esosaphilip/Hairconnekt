import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { AppCacheInterceptor, CacheKeyBuilder } from '../cache/app-cache.interceptor';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => {
    const q = String((req.query.query || req.query.q || '')).trim().toLowerCase();
    const category = String(req.query.category || '').trim().toLowerCase();
    return `search:providers:${q}:${category}`;
  })
  @CacheTTL(60)
  async search(
    @Query('q') q?: string,
    @Query('query') queryStr?: string,
    @Query('category') category?: string,
    @Query('minRating') minRating?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('withinKm') withinKm?: string,
  ) {
    // Support both ?q= and ?query= from different clients
    const normalizedQuery = (queryStr || q || '').trim();
    if (!normalizedQuery) {
      return { results: [] };
    }
    const dto: SearchQueryDto = {
      query: normalizedQuery,
      category,
      minRating: minRating ? Number(minRating) : undefined,
      priceMinCents: priceMin ? Math.round(Number(priceMin) * 100) : undefined,
      priceMaxCents: priceMax ? Math.round(Number(priceMax) * 100) : undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      withinKm: withinKm ? Number(withinKm) : undefined,
    } as any;
    try {
      const res = await this.searchService.search(dto);
      return res;
    } catch (err) {
      // Fail-soft: return empty results to avoid breaking the client UI
      console.error('[SearchController] search error:', err);
      return { results: [] };
    }
  }
}
