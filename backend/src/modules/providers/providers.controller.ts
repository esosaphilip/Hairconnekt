import { Body, Controller, Get, Patch, Post, Put, Delete, Req, UseGuards, Query, Param, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { AvailabilityDto } from './dto/availability.dto';
import { UpdateBioDto } from './dto/update-bio.dto';
import { UpdateSpecializationsDto } from './dto/update-specializations.dto';
import { UpdateLanguagesDto } from './dto/update-languages.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';
import { Request } from 'express';
import { AppCacheInterceptor, CacheKeyBuilder, CachePerUser } from '../cache/app-cache.interceptor';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) { }

  @Post()
  create(@Body() dto: CreateProviderDto) {
    return { message: 'Not implemented - awaiting schemas' };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  update(@Req() req: Request, @Body() dto: UpdateProviderDto) {
    const userId = (req.user as any)?.sub;
    return this.providersService.updateProfile(userId, dto);
  }

  @Put('me/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  setAvailability(@Req() req: Request, @Body() dto: AvailabilityDto) {
    const userId = (req.user as any)?.sub;
    return this.providersService.setAvailability(userId, dto);
  }

  @Patch('profile/bio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  updateBio(@Req() req: Request, @Body() dto: UpdateBioDto) {
    const userId = (req.user as any)?.sub;
    return this.providersService.updateBio(userId, dto);
  }

  @Put('profile/specializations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  updateSpecializations(@Req() req: Request, @Body() dto: UpdateSpecializationsDto) {
    const userId = (req.user as any)?.sub;
    return this.providersService.updateSpecializations(userId, dto);
  }

  @Put('profile/languages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  updateLanguages(@Req() req: Request, @Body() dto: UpdateLanguagesDto) {
    const userId = (req.user as any)?.sub;
    return this.providersService.updateLanguages(userId, dto);
  }

  @Patch('profile/social-media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  updateSocialMedia(@Req() req: Request, @Body() dto: UpdateSocialMediaDto) {
    const userId = (req.user as any)?.sub;
    return this.providersService.updateSocialMedia(userId, dto);
  }

  @Get('profile/certifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  getCertifications(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.providersService.getCertifications(userId);
  }

  @Post('profile/certifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  addCertification(@Req() req: Request, @Body() dto: CreateCertificationDto) {
    const userId = (req.user as any)?.sub;
    return this.providersService.addCertification(userId, dto);
  }

  @Delete('profile/certifications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  removeCertification(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any)?.sub;
    return this.providersService.removeCertification(userId, id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  @UseInterceptors(AppCacheInterceptor)
  @CachePerUser()
  @CacheKeyBuilder((req) => `providers:me:user:${req.user?.sub || req.user?.id}`)
  @CacheTTL(30)
  getMyProfile(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.providersService.getMyProfile(userId);
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  async getSettings(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    // For now, return default settings or map from profile if columns exist
    // TODO: Implement actual settings persistence
    return {
      pushNotifications: true,
      emailNotifications: true,
      bookingAlerts: true,
      messageAlerts: true,
      reviewAlerts: true,
      marketingEmails: false,
      showPhoneNumber: true,
      showEmail: false,
      profileVisible: true,
      autoAcceptBookings: false,
      allowWalkIns: true,
    };
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  async updateSettings(@Req() req: Request, @Body() body: any) {
    const userId = (req.user as any)?.sub;
    // TODO: Save settings to DB
    return { success: true, ...body };
  }

  @Get('me/availability-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  getAvailabilitySettings(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.providersService.getAvailabilitySettings(userId);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  @UseInterceptors(AppCacheInterceptor)
  @CachePerUser()
  @CacheKeyBuilder((req) => `providers:dashboard:user:${req.user?.sub || req.user?.id}`)
  @CacheTTL(15)
  getDashboard(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.providersService.getDashboard(userId);
  }

  @Get('clients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  @UseInterceptors(AppCacheInterceptor)
  @CachePerUser()
  @CacheKeyBuilder((req) => `providers:clients:user:${req.user?.sub || req.user?.id}`)
  @CacheTTL(60)
  getClients(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.providersService.getClients(userId);
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
  getNearby(
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
    return this.providersService.getNearbyProviders(params);
  }

  // Public endpoint: provider public profile/details by id
  @Get('public/:id')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => `providers:public:${req.params.id}`)
  @CacheTTL(300)
  getPublicProfile(@Param('id') id: string) {
    return this.providersService.getPublicProfileById(id);
  }
}