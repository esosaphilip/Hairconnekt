import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class ProviderPortfolioListQuery {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsString()
  style_filter?: string;

  @IsOptional()
  @IsString()
  sort?: string; // latest | popular | featured
}