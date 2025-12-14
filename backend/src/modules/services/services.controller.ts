import { Body, Controller, Post, UseGuards, Req, Get, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
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
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: Request & { user: any },
  ) {
    const providerIdFromToken = req.user?.providerId;
    const userId = req.user?.sub || req.user?.id;
    const providerId = providerIdFromToken || undefined;
    const withProvider = async () => {
      if (providerId) return providerId;
      if (userId) {
        const provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
        return provider?.id;
      }
      return undefined;
    };
    return (async () => {
      const pid = await withProvider();
      if (!pid) {
        throw new BadRequestException('Provider profile not found');
      }
      return this.servicesService.create({ ...createServiceDto, providerId: String(pid) });
    })();
  }

  /**
   * List services for the authenticated provider
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Get('provider')
  listForProvider(@Req() req: Request & { user: any }) {
    const providerIdFromToken = req.user?.providerId;
    const userId = req.user?.sub || req.user?.id;
    return (async () => {
      let pid = providerIdFromToken;
      if (!pid && userId) {
        const provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
        pid = provider?.id;
      }
      return this.servicesService.listForProvider(String(pid || ''));
    })();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateServiceDto) {
    const mapped = {
      name: body.name,
      durationMinutes: body.durationMinutes,
      priceCents: body.priceCents,
      priceType: body.priceType,
      priceMaxCents: body.priceMaxCents,
      isActive: body.isActive,
      displayOrder: body.displayOrder,
      categoryId: body.categoryId,
    } as any;
    return this.servicesService.update(id, mapped);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }
}
