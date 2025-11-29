import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

class RegisterTokenDto {
  token: string;
  platform?: 'ios' | 'android' | 'web';
}

class UpdateNotificationPreferencesDto {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean; // stubbed for future use
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  send(@Body() dto: SendNotificationDto) {
    return { message: 'Not implemented - awaiting schemas' };
  }

  // Register the device push token for the logged-in user
  @Post('token')
  @UseGuards(JwtAuthGuard)
  async registerToken(@Req() req: Request, @Body() dto: RegisterTokenDto) {
    const userId = (req.user as any)?.sub;
    return this.notificationsService.registerFcmToken(userId, dto.token);
  }

  // Retrieve notification preferences for the logged-in user
  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  async getPreferences(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.notificationsService.getPreferences(userId);
  }

  // Update notification preferences for the logged-in user
  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(@Req() req: Request, @Body() dto: UpdateNotificationPreferencesDto) {
    const userId = (req.user as any)?.sub;
    return this.notificationsService.updatePreferences(userId, dto);
  }

  // List notifications for the logged-in user
  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: Request, @Query('limit') limit?: string) {
    const userId = (req.user as any)?.sub;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.notificationsService.listNotifications(userId, parsedLimit);
  }

  // Get unread count
  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async unreadCount(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.notificationsService.unreadCount(userId);
    }

  // Mark a single notification as read
  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  async markRead(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any)?.sub;
    return this.notificationsService.markRead(userId, id);
  }

  // Mark all as read
  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllRead(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.notificationsService.markAllRead(userId);
  }

  // Clear all notifications
  @Delete()
  @UseGuards(JwtAuthGuard)
  async clearAll(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.notificationsService.clearAll(userId);
  }
}