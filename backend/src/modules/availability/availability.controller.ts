import { Body, Controller, Post, Patch, UseGuards, Req, Param, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { Request } from 'express';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    @InjectRepository(ProviderProfile)
    private readonly providersRepo: Repository<ProviderProfile>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAvailabilityDto: CreateAvailabilityDto, @Req() req: Request) {
    const userId = (req as any).user?.sub;
    if (!userId) throw new NotFoundException('Authenticated user not found');
    const provider = await this.providersRepo.findOne({ where: { user: { id: userId } } });
    if (!provider) throw new NotFoundException('Provider profile not found');
    return this.availabilityService.create({ ...createAvailabilityDto, providerId: provider.id });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAvailabilityDto: UpdateAvailabilityDto) {
    return this.availabilityService.update(id, updateAvailabilityDto);
  }
}
