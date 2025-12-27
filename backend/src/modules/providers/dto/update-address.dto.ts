import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAddressDto {
    @IsString()
    @IsNotEmpty()
    street: string;

    @IsString()
    @IsNotEmpty()
    houseNumber: string;

    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    state: string;

    @IsOptional()
    @IsBoolean()
    showOnMap?: boolean;
}
