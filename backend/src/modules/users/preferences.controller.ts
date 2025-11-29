import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ClientProfilesService } from './client-profiles.service';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Controller('users/preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly clientProfilesService: ClientProfilesService) {}

  @Get()
  async getMine(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.clientProfilesService.getMine(userId);
  }

  @Patch()
  async updateMine(@Req() req: Request, @Body() body: UpdateClientProfileDto) {
    const userId = (req.user as any)?.sub;
    return this.clientProfilesService.upsertMine(userId, body);
  }
}