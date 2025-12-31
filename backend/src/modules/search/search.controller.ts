import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { AppCacheInterceptor, CacheKeyBuilder } from '../cache/app-cache.interceptor';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

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
  ) {
    // Support both ?q= and ?query= from different clients
    const normalizedQuery = (queryStr || q || '').trim();
    if (!normalizedQuery && !category) {
      return { results: [] };
    }
    const dto: SearchQueryDto = { query: normalizedQuery, category } as any;
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