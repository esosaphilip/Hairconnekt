import { IsUUID } from 'class-validator';

export class ProviderContextDto {
  @IsUUID()
  providerId: string;
}