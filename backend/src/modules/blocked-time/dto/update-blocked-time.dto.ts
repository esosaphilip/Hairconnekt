import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBlockedTimeDto {
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  customReason?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @IsBoolean()
  @IsOptional()
  repeat?: boolean;

  @IsString()
  @IsOptional()
  repeatFrequency?: string;

  @IsArray()
  @IsOptional()
  repeatDays?: string[];

  @IsString()
  @IsOptional()
  repeatEndType?: string;

  @IsDateString()
  @IsOptional()
  repeatEndDate?: string;

  @IsNumber()
  @IsOptional()
  repeatCount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
