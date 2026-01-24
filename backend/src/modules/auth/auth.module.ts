import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Register passport to enable JWT auth guard
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, RefreshToken, VerificationCode]),
    UsersModule,
    EmailModule,
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }