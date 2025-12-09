import { Body, Controller, Post, Patch, UseGuards, Req, Param } from '@nestjs/common';
import { BlockedTimeService } from './blocked-time.service';
import { CreateBlockedTimeDto } from './dto/create-blocked-time.dto';
import { UpdateBlockedTimeDto } from './dto/update-blocked-time.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import type { Request } from 'express';

@Controller('blocked-time')
export class BlockedTimeController {
  constructor(
    private readonly blockedTimeService: BlockedTimeService,
    @InjectRepository(ProviderProfile) private readonly providersRepo: Repository<ProviderProfile>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBlockedTimeDto: CreateBlockedTimeDto, @Req() req: Request & { user: any }) {
    const providerIdFromToken = req?.user?.providerId;
    const userId = req?.user?.sub || req?.user?.id;
    const resolveProviderId = async (): Promise<string | undefined> => {
      if (providerIdFromToken) return providerIdFromToken;
      if (userId) {
        const provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
        return provider?.id;
      }
      return undefined;
    };
    return (async () => {
      const pid = await resolveProviderId();
      return this.blockedTimeService.create({ ...createBlockedTimeDto, providerId: String(pid || '') });
    })();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockedTimeDto: UpdateBlockedTimeDto) {
    return this.blockedTimeService.update(id, updateBlockedTimeDto);
  }
}
