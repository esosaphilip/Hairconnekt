import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, AvailabilitySlot, ProviderProfile])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
