import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBlockedTimeDto {
  @IsUUID()
  providerId: string;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  customReason?: string;

  @IsDateString()
  startDate: string;

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
  allDay: boolean;

  @IsBoolean()
  repeat: boolean;

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
