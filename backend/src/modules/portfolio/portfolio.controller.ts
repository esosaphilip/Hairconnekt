import { Body, Controller, Delete, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { PortfolioService } from './portfolio.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { LikeImageDto } from './dto/like-image.dto';
import { UserContextDto } from './dto/user-context.dto';
import { DiscoverQueryDto } from './dto/discover.query';
import { AppCacheInterceptor, CacheKeyBuilder } from '../cache/app-cache.interceptor';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('upload')
  upload(@Body() dto: UploadImageDto) {
    return this.portfolioService.upload(dto);
  }

  @Post('like')
  like(@Body() dto: LikeImageDto) {
    return this.portfolioService.like(dto);
  }

  // POST /api/v1/portfolio/:id/like
  @Post(':id/like')
  likeById(@Param('id') imageId: string, @Body() body: UserContextDto) {
    return this.portfolioService.like({ imageId, userId: body.userId });
  }

  // DELETE /api/v1/portfolio/:id/like
  @Delete(':id/like')
  unlikeById(@Param('id') imageId: string, @Query() q: UserContextDto) {
    return this.portfolioService.unlike(imageId, q.userId);
  }

  // POST /api/v1/portfolio/:id/save
  @Post(':id/save')
  save(@Param('id') imageId: string, @Body() body: UserContextDto) {
    return this.portfolioService.saveImage(imageId, body.userId);
  }

  // DELETE /api/v1/portfolio/:id/save
  @Delete(':id/save')
  unsave(@Param('id') imageId: string, @Query() q: UserContextDto) {
    return this.portfolioService.unsaveImage(imageId, q.userId);
  }

  // GET /api/v1/portfolio/discover
  @Get('discover')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => {
    const page = Number(req.query.page ?? 1) || 1;
    const limit = Number(req.query.limit ?? 20) || 20;
    const filters = String(req.query.filters || '').trim().toLowerCase();
    const location = String(req.query.location || '').trim();
    return `portfolio:discover:${page}:${limit}:${filters}:${location}`;
  })
  @CacheTTL(60)
  discover(@Query() q: DiscoverQueryDto) {
    return this.portfolioService.discover({
      page: q.page,
      limit: q.limit,
      filters: q.filters,
      location: q.location,
    });
  }

  // GET /api/v1/portfolio/:id/analytics
  @Get(':id/analytics')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => `portfolio:analytics:${req.params.id}`)
  @CacheTTL(300)
  analytics(@Param('id') imageId: string) {
    return this.portfolioService.analytics(imageId);
  }
}