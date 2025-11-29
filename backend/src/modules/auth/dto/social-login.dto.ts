import { IsIn, IsOptional, IsString } from 'class-validator';

export class SocialLoginDto {
  @IsIn(['google', 'apple', 'facebook'])
  provider: 'google' | 'apple' | 'facebook';

  // Either accessToken or idToken depending on provider
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  idToken?: string;
}