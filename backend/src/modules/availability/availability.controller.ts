import { Body, Controller, Post, Patch, UseGuards, Req, Param, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Controller('availability')
export class AvailabilityController {
  private readonly logger = new Logger(AvailabilityController.name);

  constructor(
    private readonly availabilityService: AvailabilityService,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
  ) {}

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
      this.logger.error(`Failed to resolve provider for user ${userId}`, error);
      throw new InternalServerErrorException('Failed to resolve provider context');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAvailabilityDto: CreateAvailabilityDto, @Req() req) {
    const providerId = await this.resolveProviderId(req);
    return this.availabilityService.create({ ...createAvailabilityDto, providerId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAvailabilityDto: UpdateAvailabilityDto) {
    return this.availabilityService.update(id, updateAvailabilityDto);
  }
}
