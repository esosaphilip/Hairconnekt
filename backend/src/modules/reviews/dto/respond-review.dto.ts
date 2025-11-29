import { IsOptional, IsString } from 'class-validator';

export class RespondReviewDto {
  @IsString()
  reviewId: string;

  @IsOptional()
  @IsString()
  response?: string;
}