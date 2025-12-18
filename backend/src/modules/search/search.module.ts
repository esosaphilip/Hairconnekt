import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Review } from '../reviews/entities/review.entity';

import { ServiceCategory } from '../services/entities/service-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderProfile, User, Service, Review, ServiceCategory])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}