import { IsDateString, IsString } from 'class-validator';

export class RescheduleAppointmentDto {
  @IsString()
  appointmentId: string;

  @IsDateString()
  newStartAt: string;

  @IsDateString()
  newEndAt: string;
}