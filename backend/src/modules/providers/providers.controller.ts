import { Body, Controller, Get, Post, Query, Param, UseInterceptors, ParseUUIDPipe } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { ProvidersService } from './providers.service';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { AppCacheInterceptor, CacheKeyBuilder } from '../cache/app-cache.interceptor';
import { PortfolioService } from '../portfolio/portfolio.service';

@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly portfolioService: PortfolioService,
  ) { }

  @Post()
  async create(@Body() dto: RegisterProviderDto) {
    return this.providersService.registerProvider(dto);
  }

  // Public endpoint: nearby providers by lat/lon
  @Get('nearby')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => {
    const lat = req.query.lat != null ? Number(req.query.lat) : undefined;
    const lon = req.query.lon != null ? Number(req.query.lon) : undefined;
    const radiusKm = req.query.radiusKm != null ? Number(req.query.radiusKm) : undefined;
    const limit = req.query.limit != null ? Number(req.query.limit) : undefined;
    return `providers:nearby:${lat ?? ''}:${lon ?? ''}:${radiusKm ?? ''}:${limit ?? ''}`;
  })
  @CacheTTL(60)
  async getNearby(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('limit') limit?: string,
  ) {
    const params = {
      lat: lat != null ? Number(lat) : undefined,
      lon: lon != null ? Number(lon) : undefined,
      radiusKm: radiusKm != null ? Number(radiusKm) : undefined,
      limit: limit != null ? Number(limit) : undefined,
    };
    const data = await this.providersService.getNearbyProviders(params);
    return { success: true, data };
  }

  // Public endpoint for provider portfolio
  @Get(':id/portfolio')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => `providers:portfolio:${req.params.id}`)
  @CacheTTL(300)
  async getPortfolio(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string
  ) {
    const result = await this.portfolioService.listProviderPortfolio(id, {
      limit: Number(limit) || 20,
      sort: sort
    });

    return result.items.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      thumbnailUrl: img.thumbnailUrl || img.imageUrl,
      caption: img.caption,
      displayOrder: img.displayOrder,
    }));
  }

  // Alias: /providers/public/:id (matches what mobile frontend calls)
  @Get('public/:id')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => `providers:public:${req.params.id}`)
  @CacheTTL(300)
  async getPublicProfileAlias(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.providersService.getPublicProfileById(id);
    return { success: true, data };
  }

  // Strict UUID v4 validation ensuring this never shadows "me", "settings", or any string-based sub-route added later.
  @Get(':id([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/public')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => `providers:public:${req.params.id}`)
  @CacheTTL(300)
  async getPublicProfile(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.providersService.getPublicProfileById(id);
    return { success: true, data };
  }

  // Strict UUID v4 validation to fix UUID parsing errors caused by routing collisions
  @Get(':id([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/services')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => `providers:services:${req.params.id}`)
  @CacheTTL(300)
  async getServices(@Param('id', new ParseUUIDPipe()) id: string) {
    // Public endpoint to get active services for a provider
    const data = await this.providersService.getPublicServices(id);
    return { success: true, data };
  }
}