import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './controllers/category.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminCategoryService } from './services/admin-category.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminStatsService } from './services/admin-stats.service';
import { ServiceCategory } from '../services/entities/service-category.entity';
import { User } from '../users/entities/user.entity';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { Service } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ServiceCategory,
      User,
      ProviderProfile,
      Service,
      Appointment
    ])
  ],
  controllers: [
    CategoryController,
    AdminUsersController,
    AdminStatsController
  ],
  providers: [
    AdminCategoryService,
    AdminUsersService,
    AdminStatsService
  ],
})
export class AdminModule { }
