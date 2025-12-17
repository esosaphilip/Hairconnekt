import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBioDto {
  @ApiProperty({ description: 'Provider biography (max 500 chars)', maxLength: 500 })
  @IsString({ message: 'Bio muss ein Text sein' })
  @MaxLength(500, { message: 'Die Bio darf maximal 500 Zeichen lang sein' })
  bio: string;
}
