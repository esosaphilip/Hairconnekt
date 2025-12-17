import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCertificationDto {
  @ApiProperty({ description: 'Title of the certification' })
  @IsString({ message: 'Titel muss ein Text sein' })
  @IsNotEmpty({ message: 'Titel darf nicht leer sein' })
  @MaxLength(255, { message: 'Titel ist zu lang' })
  title: string;

  @ApiProperty({ description: 'Institution name' })
  @IsString({ message: 'Institution muss ein Text sein' })
  @IsNotEmpty({ message: 'Institution darf nicht leer sein' })
  @MaxLength(255, { message: 'Institution ist zu lang' })
  institution: string;

  @ApiProperty({ description: 'Year of certification (YYYY)', example: '2023' })
  @IsString({ message: 'Jahr muss ein Text sein' })
  @Matches(/^\d{4}$/, { message: 'Jahr muss 4 Ziffern haben (z.B. 2023)' })
  year: string;
}
