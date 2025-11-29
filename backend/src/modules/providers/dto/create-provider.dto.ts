import { IsOptional, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  bio?: string;
}