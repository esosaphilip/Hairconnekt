import { Controller, Get, Patch, Put, Body, Req, UseGuards, Query, UseInterceptors, UploadedFile, UploadedFiles, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CacheTTL } from '@nestjs/cache-manager';
import { Request } from 'express';

import { ProvidersService } from './providers.service';
import { ServicesService } from '../services/services.service';
import { PortfolioService } from '../portfolio/portfolio.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';

import { UpdateProviderDto } from './dto/update-provider.dto';
import { AvailabilityDto } from './dto/availability.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateBioDto } from './dto/update-bio.dto';
import { UpdateSpecializationsDto } from './dto/update-specializations.dto';
import { UpdateLanguagesDto } from './dto/update-languages.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { CreateCertificationDto } from './dto/create-certification.dto';

import { AppCacheInterceptor, CacheKeyBuilder, CachePerUser } from '../cache/app-cache.interceptor';

@Controller('providers/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.PROVIDER, UserType.BOTH)
export class ProvidersMeController {
    constructor(
        private readonly providersService: ProvidersService,
        private readonly servicesService: ServicesService,
        private readonly portfolioService: PortfolioService,
    ) { }

    @Get()
    @UseInterceptors(AppCacheInterceptor)
    @CachePerUser()
    @CacheKeyBuilder((req) => `providers:me:user:${req.user?.sub || req.user?.id}`)
    @CacheTTL(30)
    getMyProfile(@Req() req: Request) {
        const userId = (req.user as any)?.sub;
        return this.providersService.getMyProfile(userId);
    }

    @Patch()
    update(@Req() req: Request, @Body() dto: UpdateProviderDto) {
        const userId = (req.user as any)?.sub;
        return this.providersService.updateProfile(userId, dto);
    }

    @Get('availability')
    getAvailability(@Req() req: Request) {
        const userId = (req.user as any)?.sub;
        return this.providersService.getAvailabilitySettings(userId);
    }

    @Put('availability')
    setAvailability(@Req() req: Request, @Body() dto: AvailabilityDto) {
        const userId = (req.user as any)?.sub;
        return this.providersService.setAvailability(userId, dto);
    }

    @Put('address')
    updateAddress(@Req() req: Request, @Body() dto: UpdateAddressDto) {
        const userId = (req.user as any)?.sub;
        return this.providersService.updateAddress(userId, dto);
    }

    @Patch('profile/bio')
    updateBio(@Req() req: Request, @Body() dto: UpdateBioDto) {
        const userId = (req.user as any)?.sub;
        return this.providersService.updateBio(userId, dto);
    }

    @Post('profile-picture')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    uploadProfilePicture(@Req() req: Request, @UploadedFile() file: any) {
        const userId = (req.user as any)?.sub;
        return this.providersService.uploadProfilePicture(userId, file);
    }

    @Post('portfolio')
    @UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() }))
    async uploadPortfolioImages(
        @Req() req: Request,
        @UploadedFiles() files: any[],
        @Body() body: any,
    ) {
        const userId = (req.user as any)?.sub || (req.user as any)?.id;
        const providerId = await this.servicesService.getProviderIdByUserId(userId);

        if (!files || files.length === 0) {
            return { success: false, message: 'No images provided' };
        }

        const results = await Promise.all(
            files.map(file => this.portfolioService.uploadMultipart(providerId, file, body))
        );
        return { success: true, data: results };
    }

    @Put('profile/specializations')
    updateSpecializations(@Req() req: Request, @Body() dto: UpdateSpecializationsDto) {
        const userId = (req.user as any)?.sub;
        return this.providersService.updateSpecializations(userId, dto);
    }

    @Put('profile/languages')
    updateLanguages(@Req() req: Request, @Body() dto: UpdateLanguagesDto) {
        const userId = (req.user as any)?.sub;
        return this.providersService.updateLanguages(userId, dto);
    }

    @Patch('profile/social-media')
    updateSocialMedia(@Req() req: Request, @Body() dto: UpdateSocialMediaDto) {
        const userId = (req.user as any)?.sub;
        return this.providersService.updateSocialMedia(userId, dto);
    }

    @Get('profile/certifications')
    getCertifications(@Req() req: Request) {
        const userId = (req.user as any)?.sub;
        return this.providersService.getCertifications(userId);
    }

    @Post('profile/certifications')
    addCertification(@Req() req: Request, @Body() dto: CreateCertificationDto) {
        const userId = (req.user as any)?.sub;
        return this.providersService.addCertification(userId, dto);
    }

    @Delete('profile/certifications/:id')
    removeCertification(@Req() req: Request, @Param('id', new ParseUUIDPipe()) id: string) {
        const userId = (req.user as any)?.sub;
        return this.providersService.removeCertification(userId, id);
    }

    @Get('settings')
    async getSettings(@Req() req: Request) {
        const userId = (req.user as any)?.sub;
        return this.providersService.getSettings(userId);
    }

    @Patch('settings')
    async updateSettings(@Req() req: Request, @Body() body: any) {
        const userId = (req.user as any)?.sub;
        return this.providersService.updateSettings(userId, body);
    }

    @Get('availability-settings')
    getAvailabilitySettings(@Req() req: Request) {
        const userId = (req.user as any)?.sub;
        return this.providersService.getAvailabilitySettings(userId);
    }

    @Get('calendar')
    async getCalendar(@Req() req: Request, @Query('startDate') startDate: string, @Query('endDate') endDate: string, @Query('view') view: string) {
        const userId = (req.user as any)?.sub;
        const data = await this.providersService.getCalendar(userId, { startDate, endDate, view });
        return { success: true, data };
    }

    @Get('dashboard')
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
    @UseInterceptors(AppCacheInterceptor)
    @CachePerUser()
    @CacheKeyBuilder((req) => `providers:clients:user:${req.user?.sub || req.user?.id}`)
    @CacheTTL(60)
    async getClients(@Req() req: Request) {
        const userId = (req.user as any)?.sub;
        const data = await this.providersService.getClients(userId);
        return { success: true, data };
    }

    @Get('clients/:clientId')
    async getClientDetail(@Req() req: Request, @Param('clientId') clientId: string) {
        const userId = (req.user as any)?.sub;
        const data = await this.providersService.getClientDetail(userId, clientId);
        return { success: true, data };
    }

    @Post('clients')
    async addClient(@Req() req: Request, @Body() body: any) {
        const userId = (req.user as any)?.sub;
        const data = await this.providersService.addClient(userId, body);
        return { success: true, data };
    }

    @Patch('clients/:clientId/notes')
    async updateClientNotes(@Req() req: Request, @Param('clientId') clientId: string, @Body() body: { providerNotes: string }) {
        const userId = (req.user as any)?.sub;
        // Note: API client sends 'providerNotes', service expects 'notes'
        const data = await this.providersService.updateClientNotes(userId, clientId, body.providerNotes);
        return { success: true, data };
    }

    @Patch('clients/:clientId/vip-status')
    async updateClientVip(@Req() req: Request, @Param('clientId') clientId: string, @Body() body: { isVIP: boolean }) {
        const userId = (req.user as any)?.sub;
        const data = await this.providersService.updateClientVip(userId, clientId, body.isVIP);
        return { success: true, data };
    }

    @Post('clients/:clientId/block')
    async blockClient(@Req() req: Request, @Param('clientId') clientId: string, @Body() body: { reason: string }) {
        const userId = (req.user as any)?.sub;
        const data = await this.providersService.blockClient(userId, clientId, body.reason);
        return { success: true, data };
    }

    // --- Services Integration ---

    @Get('services')
    async getMyServices(@Req() req: Request & { user: any }) {
        console.log('[FIRE-DEBUG] GET /providers/me/services HIT (ProvidersMeController)');
        const userId = req.user.sub || req.user.id;
        const providerId = await this.servicesService.getProviderIdByUserId(userId);
        return this.servicesService.listForProvider(providerId);
    }

    // Consolidated Single Source of Truth for Provider Media Uploads
    @Post('services/image')
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async uploadServiceImage(@Req() req: Request & { user: any }, @UploadedFile() file: any) {
        const userId = req.user.sub || req.user.id;
        const providerId = await this.servicesService.getProviderIdByUserId(userId);
        return this.servicesService.uploadImage(providerId, file);
    }
}
