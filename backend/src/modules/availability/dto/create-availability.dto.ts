import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { DayOfWeek } from '../entities/availability-slot.entity';

class AvailabilitySlotDto {
  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class CreateAvailabilityDto {
  @IsUUID()
  providerId: string;

  @IsNumber()
  bufferTime: number;

  @IsNumber()
  advanceBookingDays: number;

  @IsBoolean()
  sameDayBooking: boolean;

  @IsNumber()
  minAdvanceHours: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots: AvailabilitySlotDto[];
}
