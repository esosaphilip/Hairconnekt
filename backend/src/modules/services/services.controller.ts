import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import type { Request } from 'express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserType } from '../users/entities/user.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: Request & { user: any },
  ) {
    const providerId = req.user.providerId; // Assuming providerId is on the user object
    return this.servicesService.create({ ...createServiceDto, providerId });
  }

  /**
   * List services for the authenticated provider
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  @Get('provider')
  listForProvider(@Req() req: Request & { user: any }) {
    const providerId = req.user.providerId;
    return this.servicesService.listForProvider(providerId);
  }
}