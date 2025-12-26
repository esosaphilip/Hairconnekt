import { Body, Controller, Get, Patch, Post, Put, Delete, Req, UseGuards, Query, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { CreateTimeOffDto } from './dto/create-time-off.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';
import { Request } from 'express';
import { AppCacheInterceptor, CacheKeyBuilder, CachePerUser } from '../cache/app-cache.interceptor';

import { ServicesService } from '../services/services.service';

@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly servicesService: ServicesService,
  ) { }

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

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePicture(@Req() req: Request, @UploadedFile() file: any) {
    const userId = (req.user as any)?.sub;
    return this.providersService.uploadProfilePicture(userId, file);
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

  @Get('me/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  async getMyServices(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    console.log('[FIRE-DEBUG] ProvidersController GET /providers/me/services HIT (Direct Route)');
    const providerId = await this.servicesService.getProviderIdByUserId(userId);
    return this.servicesService.listForProvider(providerId);
  }

  @Post('me/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  async createService(@Req() req: Request, @Body() body: any) {
    const userId = (req.user as any)?.sub;
    console.log('[FIRE-DEBUG] ProvidersController POST /providers/me/services HIT (Direct Route)');
    // Resolve provider ID internally
    const providerId = await this.servicesService.getProviderIdByUserId(userId);
    return this.servicesService.create(providerId, body);
  }

  @Patch('me/services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  async updateService(@Req() req: Request, @Param('id') id: string, @Body() body: any) {
    const userId = (req.user as any)?.sub;
    console.log(`[FIRE-DEBUG] ProvidersController PATCH /providers/me/services/${id} HIT (Direct Route)`);
    const providerId = await this.servicesService.getProviderIdByUserId(userId);
    return this.servicesService.update(id, providerId, body);
  }

  @Delete('me/services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  async deleteService(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any)?.sub;
    console.log(`[FIRE-DEBUG] ProvidersController DELETE /providers/me/services/${id} HIT (Direct Route)`);
    const providerId = await this.servicesService.getProviderIdByUserId(userId);
    return this.servicesService.delete(id, providerId);
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

  @Get('calendar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  async getCalendar(@Req() req: Request, @Query('startDate') startDate: string, @Query('endDate') endDate: string, @Query('view') view: string) {
    const userId = (req.user as any)?.sub;
    const data = await this.providersService.getCalendar(userId, { startDate, endDate, view });
    return { success: true, data };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  @UseInterceptors(AppCacheInterceptor)
  @CachePerUser()
  @CacheKeyBuilder((req) => `providers:dashboard:user:${req.user?.sub || req.user?.id}`)
  @CacheTTL(15)
  async getDashboard(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    const data = await this.providersService.getDashboard(userId);
    return { success: true, data };
  }

  @Get('clients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  @UseInterceptors(AppCacheInterceptor)
  @CachePerUser()
  @CacheKeyBuilder((req) => `providers:clients:user:${req.user?.sub || req.user?.id}`)
  @CacheTTL(60)
  async getClients(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    const data = await this.providersService.getClients(userId);
    return { success: true, data };
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

  // Public endpoint: provider public profile/details by id
  @Get('public/:id')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => `providers:public:${req.params.id}`)
  @CacheTTL(300)
  async getPublicProfile(@Param('id') id: string) {
    const data = await this.providersService.getPublicProfileById(id);
    return { success: true, data };
  }

  @Get(':id/services')
  @UseInterceptors(AppCacheInterceptor)
  @CacheKeyBuilder((req) => `providers:services:${req.params.id}`)
  @CacheTTL(300)
  async getServices(@Param('id') id: string) {
    // Public endpoint to get active services for a provider
    const data = await this.providersService.getPublicServices(id);
    return { success: true, data };
  }
}