import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { Request } from 'express';

@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.CLIENT)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  async add(@Req() req: Request, @Body() dto: ToggleFavoriteDto) {
    const userId = (req.user as any)?.sub;
    return this.favoritesService.add(userId, dto.providerId);
  }

  @Delete(':providerId')
  async remove(@Req() req: Request, @Param('providerId') providerId: string) {
    const userId = (req.user as any)?.sub;
    return this.favoritesService.remove(userId, providerId);
  }

  @Get()
  async list(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    const items = await this.favoritesService.list(userId);
    return { results: items };
  }

  // Helper endpoint: return which of the given providerIds are favorited
  @Get('status')
  async status(@Req() req: Request, @Query('providerIds') providerIdsStr?: string) {
    const userId = (req.user as any)?.sub;
    const providerIds = (providerIdsStr || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return this.favoritesService.status(userId, providerIds);
  }
}