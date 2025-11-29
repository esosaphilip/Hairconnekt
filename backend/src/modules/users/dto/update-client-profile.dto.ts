import { IsArray, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender, HairLength, HairType } from '../entities/client-profile.entity';

export class UpdateClientProfileDto {
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;

  @IsOptional()
  @IsEnum(HairType)
  hairType?: HairType | null;

  @IsOptional()
  @IsEnum(HairLength)
  hairLength?: HairLength | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredStyles?: string[] | null;

  @IsOptional()
  @IsString()
  allergies?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}