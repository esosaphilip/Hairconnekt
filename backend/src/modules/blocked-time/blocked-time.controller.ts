import { Body, Controller, Post, Patch, UseGuards, Req, Param, NotFoundException } from '@nestjs/common';
import { BlockedTimeService } from './blocked-time.service';
import { CreateBlockedTimeDto } from './dto/create-blocked-time.dto';
import { UpdateBlockedTimeDto } from './dto/update-blocked-time.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { Request } from 'express';

@Controller('blocked-time')
export class BlockedTimeController {
  constructor(
    private readonly blockedTimeService: BlockedTimeService,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createBlockedTimeDto: CreateBlockedTimeDto, @Req() req: Request) {
    const userId = (req as any).user?.sub;
    if (!userId) throw new NotFoundException('Authenticated user not found');
    const provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
    if (!provider) throw new NotFoundException('Provider profile not found');
    return this.blockedTimeService.create({ ...createBlockedTimeDto, providerId: provider.id });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockedTimeDto: UpdateBlockedTimeDto) {
    return this.blockedTimeService.update(id, updateBlockedTimeDto);
  }
}
