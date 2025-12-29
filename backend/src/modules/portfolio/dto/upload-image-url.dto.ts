import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UploadImageUrlDto {
    @IsString()
    @IsNotEmpty()
    imageUrl: string;

    @IsOptional()
    @IsString()
    caption?: string;

    @IsOptional()
    tags?: any;

    @IsOptional()
    metadata?: any;
}
