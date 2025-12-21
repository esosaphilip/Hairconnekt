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
  acceptsSameDayBooking?: boolean;
}