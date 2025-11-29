import { IsIn, IsOptional, IsString } from 'class-validator';

export class ResendVerificationDto {
  // Provide either email or phone. If both provided, 'channel' decides which one to use
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['email', 'phone'])
  channel?: 'email' | 'phone';
}