import { IsString, IsOptional } from 'class-validator';

export class UploadImageDto {
  @IsString()
  providerId: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  caption?: string;
}