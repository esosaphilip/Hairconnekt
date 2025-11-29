import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePortfolioImageDto {
  // Temporary ownership check until auth: providerId required
  @IsUUID()
  providerId: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  tags?: string; // JSON string or comma-separated

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string
}