import { Body, Controller, Post, Patch, UseGuards, Req, Param, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(BlockedTimeController.name);

  constructor(
    private readonly blockedTimeService: BlockedTimeService,
    @InjectRepository(ProviderProfile) private readonly providersRepo: Repository<ProviderProfile>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createBlockedTimeDto: CreateBlockedTimeDto, @Req() req: Request & { user: any }) {
    try {
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

      const pid = await resolveProviderId();
      
      if (!pid) {
        this.logger.warn(`Failed to resolve provider ID for user ${userId}`);
        throw new BadRequestException('Provider ID could not be resolved. Please ensure you are registered as a provider.');
      }

      return await this.blockedTimeService.create({ ...createBlockedTimeDto, providerId: String(pid) });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error creating blocked time', error);
      throw new InternalServerErrorException('Failed to create blocked time entry');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockedTimeDto: UpdateBlockedTimeDto) {
    return this.blockedTimeService.update(id, updateBlockedTimeDto);
  }
}
