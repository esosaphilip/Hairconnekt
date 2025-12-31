import { IsOptional, IsString } from 'class-validator';

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  bufferTimeMinutes?: number;

  @IsOptional()
  advanceBookingDays?: number;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string; // New: Client uploads to Firebase, sends URL here

  @IsOptional()
  acceptsSameDayBooking?: boolean;
}