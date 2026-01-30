import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessType } from '../entities/provider-profile.entity';
import { LanguageEnum } from './update-languages.dto';

class ContactDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    phone: string;
}

class ProfileDto {
    @IsOptional()
    @IsString()
    businessName?: string;

    @IsEnum(BusinessType)
    businessType: BusinessType;

    @IsNumber()
    yearsOfExperience: number;

    @IsBoolean()
    isMobileService: boolean;

    @IsNumber()
    serviceRadiusKm: number;
}

class AddressDto {
    @IsString()
    street: string;

    @IsString()
    houseNumber: string;

    @IsString()
    postalCode: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsBoolean()
    showOnMap: boolean;
}

export class RegisterProviderDto {
    @IsString()
    password: string;

    @ValidateNested()
    @Type(() => ProfileDto)
    profile: ProfileDto;

    @ValidateNested()
    @Type(() => ContactDto)
    contact: ContactDto;

    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;

    @IsArray()
    @IsString({ each: true })
    services: string[];

    @IsArray()
    @IsEnum(LanguageEnum, { each: true })
    languages: LanguageEnum[];

    @IsArray()
    @IsString({ each: true })
    specializations: string[];
}
