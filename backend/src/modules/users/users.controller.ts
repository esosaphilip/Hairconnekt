import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  // Avatar upload endpoint temporarily disabled until StorageModule is ready
}