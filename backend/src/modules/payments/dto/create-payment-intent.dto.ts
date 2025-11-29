import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(1)
  @Max(100000)
  amount: number;

  @IsString()
  @IsIn(['eur'])
  currency: string;

  @IsString()
  appointmentId: string;

  @IsOptional()
  @IsString()
  providerId?: string;
}