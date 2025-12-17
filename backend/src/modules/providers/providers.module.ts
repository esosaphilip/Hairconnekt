import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProviderProfile } from './entities/provider-profile.entity';
import { ProviderLocation } from './entities/provider-location.entity';
import { ProviderLanguage } from './entities/provider-language.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { ProviderTimeOff } from './entities/provider-time-off.entity';
import { ProviderSpecialization } from './entities/provider-specialization.entity';
import { ProviderCertification } from './entities/provider-certification.entity';
import { VerificationDocument } from './entities/verification-document.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentService } from '../appointments/entities/appointment-service.entity';
import { Review } from '../reviews/entities/review.entity';
import { Service } from '../services/entities/service.entity';
import { ServiceCategory } from '../services/entities/service-category.entity';
import { PortfolioImage } from '../portfolio/entities/portfolio-image.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderProfile,
      ProviderLocation,
      ProviderLanguage,
      ProviderAvailability,
      ProviderTimeOff,
      ProviderSpecialization,
      ProviderCertification,
      VerificationDocument,
      Appointment,
      AppointmentService,
      Service,
      ServiceCategory,
      PortfolioImage,
      Review,
    ]),
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService, RolesGuard],
  exports: [ProvidersService],
})
export class ProvidersModule {}