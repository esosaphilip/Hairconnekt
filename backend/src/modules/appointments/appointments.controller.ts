import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards, BadRequestException, InternalServerErrorException, Logger, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { Request } from 'express';

@Controller('appointments')
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(
    private readonly appointmentsService: AppointmentsService,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
  ) { }

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
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to resolve provider for user ${userId}`, error);
      throw new InternalServerErrorException('Failed to resolve provider context');
    }
  }

  // Client side listings
  @Get('client')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.CLIENT, UserType.BOTH)
  listClientAppointments(@Req() req: Request, @Query('status') status?: 'upcoming' | 'completed' | 'cancelled') {
    const userId = (req.user as any)?.sub;
    return this.appointmentsService.listClientAppointments(userId, status || 'upcoming');
  }

  // Provider side listings
  @Get('provider')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER, UserType.BOTH)
  listProviderAppointments(@Req() req: Request, @Query('status') status?: 'upcoming' | 'completed' | 'cancelled') {
    const userId = (req.user as any)?.sub;
    return this.appointmentsService.listProviderAppointments(userId, status || 'upcoming');
  }

  @UseGuards(JwtAuthGuard)
  @Post('provider-create')
  async createProviderAppointment(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: Request) {
    const providerId = await this.resolveProviderId(req);
    return this.appointmentsService.create({ ...createAppointmentDto, providerId });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: Request) {
    // Attempt to determine if the user is acting as a provider
    let providerId: string | undefined;
    try {
      providerId = await this.resolveProviderId(req);
    } catch {
      // Not a provider, treat as client
    }

    if (providerId) {
      // User is a provider creating a booking (e.g. walk-in or phone)
      createAppointmentDto.providerId = providerId;
    } else {
      // User is a client creating a booking
      const userId = (req.user as any)?.sub || (req.user as any)?.id;
      if (!userId) throw new BadRequestException('User ID not found');

      createAppointmentDto.clientId = userId;

      if (!createAppointmentDto.providerId) {
        throw new BadRequestException('Provider ID is required for client bookings');
      }
    }

    return this.appointmentsService.create(createAppointmentDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.PROVIDER)
  async updateStatus(@Param('id') id: string, @Body('status') status: import('./entities/appointment.entity').AppointmentStatus, @Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.appointmentsService.updateStatus(id, status, userId);
  }

  @Patch()
  update(@Body() dto: UpdateAppointmentDto) {
    return { message: 'Not implemented - awaiting schemas' };
  }

  @Post('reschedule')
  reschedule(@Body() dto: RescheduleAppointmentDto) {
    return { message: 'Not implemented - awaiting schemas' };
  }
}
