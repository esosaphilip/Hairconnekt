import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsBoolean()
  acceptsSameDayBooking?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  advanceBookingDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bufferTimeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minAdvanceHours?: number;
}
