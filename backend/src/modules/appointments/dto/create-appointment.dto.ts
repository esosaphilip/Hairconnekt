import { IsArray, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  providerId: string;

  @IsUUID()
  clientId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  serviceIds: string[];

  @IsDateString()
  appointmentDate: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
