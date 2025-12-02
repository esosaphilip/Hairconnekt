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
import { PortfolioModule } from './modules/portfolio/portfolio.module';

@Module({
  imports: [
    // Global config/env validation
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    // Database connection (Postgres/Neon via DATABASE_URL)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || process.env.NEON_DB_STRING,
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
    ProvidersModule,
    ReviewsModule,
    ServicesModule,
    PortfolioModule,
    // Register appointments API routes (client/provider listings, create, etc.)
    AppointmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
