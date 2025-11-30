import { Body, Controller, Post, Patch, UseGuards, Req, Param, Get } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createAvailabilityDto: CreateAvailabilityDto, @Req() req) {
    const providerId = req.user.providerId; // Assuming providerId is on the user object
    return this.availabilityService.create({ ...createAvailabilityDto, providerId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAvailabilityDto: UpdateAvailabilityDto) {
    return this.availabilityService.update(id, updateAvailabilityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getForProvider(@Req() req) {
    const providerId = req.user.providerId;
    return this.availabilityService.findByProvider(providerId);
  }
}
