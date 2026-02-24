import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from '../services/services.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { ProvidersController } from './providers.controller';
import { ProvidersMeController } from './providers-me.controller';
import { SharedModule } from '../../shared/shared.module';
import { ProvidersService } from './providers.service';
import { ProviderProfile } from './entities/provider-profile.entity';
import { User } from '../users/entities/user.entity'; // Add User import
import { Address } from '../users/entities/address.entity'; // Add Address import
import { StorageModule } from '../storage/storage.module'; // Add StorageModule import
import { ProviderLocation } from './entities/provider-location.entity';
import { ProviderLanguage } from './entities/provider-language.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { ProviderTimeOff } from './entities/provider-time-off.entity';
import { ProviderSpecialization } from './entities/provider-specialization.entity';
import { ProviderCertification } from './entities/provider-certification.entity';
import { ProviderSettings } from './entities/provider-settings.entity';
import { VerificationDocument } from './entities/verification-document.entity';
import { ProviderClient } from './entities/provider-client.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentService } from '../appointments/entities/appointment-service.entity';
import { Review } from '../reviews/entities/review.entity';
import { Service } from '../services/entities/service.entity';
import { ServiceCategory } from '../services/entities/service-category.entity';
import { PortfolioImage } from '../portfolio/entities/portfolio-image.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TypeORMProviderRepository } from '../../infrastructure/repositories/TypeORMProviderRepository';

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
      User,
      Address,
      ProviderSettings,
      ProviderClient,
    ]),
    StorageModule,
    ServicesModule,
    PortfolioModule,
    SharedModule, // Imported for GeocodingService
    forwardRef(() => AuthModule),
  ],
  controllers: [ProvidersController, ProvidersMeController],
  providers: [
    ProvidersService,
    RolesGuard,
    {
      provide: 'IProviderRepository',
      useClass: TypeORMProviderRepository,
    },
  ],
  exports: [ProvidersService, 'IProviderRepository'],
})
export class ProvidersModule { }