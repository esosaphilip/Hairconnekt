import { IsBoolean, IsNumberString, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MaxLength(50)
  label: string;

  @IsString()
  @MaxLength(255)
  streetAddress: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  state: string;

  @IsString()
  @Length(2, 20)
  postalCode: string;

  @IsString()
  @Length(2, 2)
  country: string;

  @IsOptional()
  @IsNumberString()
  latitude?: string;

  @IsOptional()
  @IsNumberString()
  longitude?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}