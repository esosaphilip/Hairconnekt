import { Body, Controller, Get, Patch, Post, Delete, Param, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req: Request, @Body() body: UpdateUserDto) {
    const userId = (req.user as any)?.sub;
    return this.usersService.updateMe(userId, body as any);
  }

  @Patch('me/language')
  @UseGuards(JwtAuthGuard)
  async updateLanguage(@Req() req: Request, @Body() body: { preferredLanguage: string }) {
    const userId = (req.user as any)?.sub;
    return this.usersService.updateLanguage(userId, body.preferredLanguage);
  }

  @Patch('me/fcm-token')
  @UseGuards(JwtAuthGuard)
  async updateFcmToken(@Req() req: Request, @Body() body: { fcmToken: string }) {
    const userId = (req.user as any)?.sub;
    return this.usersService.updateFcmToken(userId, body.fcmToken);
  }

  @Get('me/preferences')
  @UseGuards(JwtAuthGuard)
  async getPreferences(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.usersService.getPreferences(userId);
  }

  @Patch('me/preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(@Req() req: Request, @Body() body: any) {
    const userId = (req.user as any)?.sub;
    return this.usersService.updatePreferences(userId, body);
  }

  // Avatar upload endpoint
  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadAvatar(@Req() req: Request, @UploadedFile() file: any) {
    const userId = (req.user as any)?.sub;
    return this.usersService.uploadProfilePicture(userId, file);
  }

  @Post(':id/block')
  @UseGuards(JwtAuthGuard)
  async blockUser(@Req() req: Request, @Param('id') blockedId: string) {
    const userId = (req.user as any)?.sub;
    await this.usersService.blockUser(userId, blockedId);
    return { success: true, message: 'User blocked' };
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  async reportUser(
    @Req() req: Request,
    @Param('id') reportedId: string,
    @Body() body: { reason: string; details?: string },
  ) {
    const userId = (req.user as any)?.sub;
    await this.usersService.reportUser(userId, reportedId, body.reason, body.details);
    return { success: true, message: 'User reported' };
  }

  @Get('me/addresses')
  @UseGuards(JwtAuthGuard)
  async getAddresses(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    const addresses = await this.usersService.getAddresses(userId);
    return { success: true, data: addresses };
  }

  @Delete('me/addresses/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAddress(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any)?.sub;
    return this.usersService.deleteAddress(userId, id);
  }

  @Patch('me/addresses/:id/default')
  @UseGuards(JwtAuthGuard)
  async setDefaultAddress(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any)?.sub;
    return this.usersService.setDefaultAddress(userId, id);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    await this.usersService.deactivateUser(userId);
    return { success: true, message: 'User account deactivated' };
  }
}