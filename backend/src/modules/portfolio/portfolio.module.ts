import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { PortfolioImage } from './entities/portfolio-image.entity';
import { PortfolioImageLike } from './entities/portfolio-image-like.entity';
import { SavedPortfolioImage } from './entities/saved-portfolio-image.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { ServiceCategory } from '../services/entities/service-category.entity';
import { StorageModule } from '../storage/storage.module';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([
      PortfolioImage,
      PortfolioImageLike,
      SavedPortfolioImage,
      // cross-module entities used by this service
      ProviderProfile,
      User,
      ServiceCategory,
      Appointment,
    ]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule { }