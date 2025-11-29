import { IsOptional, IsString } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  category?: string;
}