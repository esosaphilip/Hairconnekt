import { IsArray, IsOptional, IsString } from 'class-validator';

export class AvailabilityDto {
  @IsArray()
  slots: Array<{ weekday: string; start: string; end: string }>;

  @IsOptional()
  @IsString()
  timezone?: string;
}