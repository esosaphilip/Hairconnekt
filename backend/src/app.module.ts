import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';

// Core feature modules required for authentication and basic API
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { SmsModule } from './modules/sms/sms.module';
import { HealthModule } from './modules/health/health.module';
// Re-enable feature modules needed for provider dashboard and reviews
import { ProvidersModule } from './modules/providers/providers.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AppCacheModule } from './modules/cache/cache.module';
import { ServicesModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AdminModule } from './modules/admin/admin.module';
import { BlockedTimeModule } from './modules/blocked-time/blocked-time.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { SearchModule } from './modules/search/search.module';
import { StorageModule } from './modules/storage/storage.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    // Global config/env validation
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    // Database connection (Postgres/Neon via DATABASE_URL)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: false,
    }),
    // Global cache module (Redis) for caching interceptors and services
    AppCacheModule,
    // Minimal modules to get the backend online for login
    AuthModule,
    UsersModule,
    EmailModule,
    SmsModule,
    HealthModule,
    // Feature modules required by provider dashboard and reviews screens
    ServicesModule, // Moved BEFORE ProvidersModule to prevent route collision (providers/me/services vs providers/:id/services)
    ProvidersModule,
    ReviewsModule,
    BlockedTimeModule,
    // Register appointments API routes (client/provider listings, create, etc.)
    AppointmentsModule,
    AdminModule,
    // Additional Feature Modules
    AnalyticsModule,
    AvailabilityModule,
    FavoritesModule,
    MessagesModule,
    NotificationsModule,
    PaymentsModule,
    PortfolioModule,
    SearchModule,
    StorageModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
