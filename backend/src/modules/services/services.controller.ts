import { Body, Controller, Post, UseGuards, Req, Get, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserType } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    @InjectRepository(ProviderProfile) private readonly providersRepo: Repository<ProviderProfile>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: Request & { user: any },
  ) {
    const userId = (req.user as any)?.sub;
    if (!userId) throw new NotFoundException('Authenticated user not found');
    return this.providersRepo
      .findOne({ where: { user: { id: userId } }, select: { id: true } })
      .then((provider) => {
        if (!provider) throw new NotFoundException('Provider profile not found');
        return this.servicesService.create({ ...createServiceDto, providerId: provider.id });
      });
  }

  /**
   * List services for the authenticated provider
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Get('provider')
  listForProvider(@Req() req: Request & { user: any }) {
    const userId = (req.user as any)?.sub;
    if (!userId) throw new NotFoundException('Authenticated user not found');
    return this.providersRepo
      .findOne({ where: { user: { id: userId } }, select: { id: true } })
      .then((provider) => {
        if (!provider) throw new NotFoundException('Provider profile not found');
        return this.servicesService.listForProvider(provider.id);
      });
  }
}
