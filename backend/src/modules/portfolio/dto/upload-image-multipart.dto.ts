import { IsOptional, IsString, IsUUID } from 'class-validator';

// Used for multipart form fields when uploading an image
export class UploadImageMultipartDto {
  // Temporary until auth is wired: providerId is required to associate upload
  @IsUUID()
  providerId: string;

  @IsOptional()
  @IsString()
  caption?: string;

  // Accept JSON string or comma-separated values; controller will parse
  @IsOptional()
  @IsString()
  tags?: string;

  // Accept JSON string; controller will parse
  @IsOptional()
  @IsString()
  metadata?: string;
}