import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedTime } from './entities/blocked-time.entity';
import { BlockedTimeController } from './blocked-time.controller';
import { BlockedTimeService } from './blocked-time.service';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedTime, ProviderProfile])],
  controllers: [BlockedTimeController],
  providers: [BlockedTimeService],
})
export class BlockedTimeModule {}
