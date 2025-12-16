import { IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @IsUUID()
  clientId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  serviceIds: string[];

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}