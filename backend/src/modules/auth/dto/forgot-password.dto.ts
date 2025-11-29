import { IsString } from 'class-validator';

export class ForgotPasswordDto {
  // Accept either email or phone identifier
  @IsString()
  emailOrPhone: string;
}