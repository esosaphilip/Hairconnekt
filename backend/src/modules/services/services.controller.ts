import { Body, Controller, Post, UseGuards, Req, Get, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserType } from '../users/entities/user.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Controller('services')
export class ServicesController {
  private readonly logger = new Logger(ServicesController.name);

  constructor(
    private readonly servicesService: ServicesService,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
  ) {}

  private async resolveProviderId(req: any): Promise<string> {
    const user = req.user;
    if (user?.providerId) return user.providerId;
    
    const userId = user?.sub || user?.id;
    if (!userId) throw new BadRequestException('User ID not found in request');

    try {
      const provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
      if (!provider) {
        throw new BadRequestException('User is not a registered provider');
      }
      return provider.id;
    } catch (error) {
      this.logger.error(`Failed to resolve provider for user ${userId}`, error);
      throw new InternalServerErrorException('Failed to resolve provider context');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: Request & { user: any },
  ) {
    const providerId = await this.resolveProviderId(req);
    return this.servicesService.create({ ...createServiceDto, providerId });
  }

  /**
   * List services for the authenticated provider
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Get('provider')
  async listForProvider(@Req() req: Request & { user: any }) {
    const providerId = await this.resolveProviderId(req);
    return this.servicesService.listForProvider(providerId);
  }
}
