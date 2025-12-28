import { IsOptional, IsString, IsIn, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsIn(['de', 'en', 'fr', 'es', 'it'])
  preferredLanguage?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  profilePictureUrl?: string;

  @IsOptional()
  notificationPreferences?: { push?: boolean; email?: boolean; sms?: boolean };
}