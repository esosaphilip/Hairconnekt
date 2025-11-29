import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { DayOfWeek } from '../entities/availability-slot.entity';

class AvailabilitySlotDto {
  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class UpdateAvailabilityDto {
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @IsNumber()
  @IsOptional()
  bufferTime?: number;

  @IsNumber()
  @IsOptional()
  advanceBookingDays?: number;

  @IsBoolean()
  @IsOptional()
  sameDayBooking?: boolean;

  @IsNumber()
  @IsOptional()
  minAdvanceHours?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  @IsOptional()
  slots?: AvailabilitySlotDto[];
}
