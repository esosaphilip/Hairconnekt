import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/entities/user.entity';
import { Request } from 'express';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

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
  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: Request) {
    // In NestJS with Passport, req.user is appended at runtime but not typed on Express Request
    const providerId = (req as any)?.user?.providerId; // Assuming providerId is on the user object
    return this.appointmentsService.create({ ...createAppointmentDto, providerId });
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