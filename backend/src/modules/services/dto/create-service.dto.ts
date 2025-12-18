import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PriceType } from '../entities/service.entity';

export class CreateServiceDto {
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  priceCents: number;

  @IsEnum(PriceType)
  @IsOptional()
  priceType?: PriceType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMaxCents?: number;

  @IsNumber()
  @Min(0)
  durationMinutes: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}