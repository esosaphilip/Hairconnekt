import { IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSocialMediaDto {
  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  @MaxLength(1024, { message: 'Website URL ist zu lang' })
  // Simple URL validation or use @IsUrl with options if strictly required
  // Relaxed regex or just string is often safer for "user input" unless strict validation requested
  website?: string;

  @ApiPropertyOptional({ description: 'Instagram handle' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  instagram?: string;

  @ApiPropertyOptional({ description: 'Facebook page/profile' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  facebook?: string;

  @ApiPropertyOptional({ description: 'Twitter/X handle' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  twitter?: string;

  @ApiPropertyOptional({ description: 'YouTube channel' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  youtube?: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  linkedin?: string;
}
