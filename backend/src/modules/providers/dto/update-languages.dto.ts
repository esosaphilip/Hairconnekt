import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LanguageEnum {
  DEUTSCH = 'Deutsch',
  ENGLISCH = 'Englisch',
  FRANZOESISCH = 'Französisch',
  SPANISCH = 'Spanisch',
  ITALIENISCH = 'Italienisch',
  PORTUGIESISCH = 'Portugiesisch',
  RUSSISCH = 'Russisch',
  TUERKISCH = 'Türkisch',
  ARABISCH = 'Arabisch',
  TWI = 'Twi',
  YORUBA = 'Yoruba',
  IGBO = 'Igbo',
  SWAHILI = 'Swahili',
  AMHARISCH = 'Amharisch',
  SOMALI = 'Somali',
  WOLOF = 'Wolof',
  HAUSA = 'Hausa',
  ZULU = 'Zulu',
}

export class UpdateLanguagesDto {
  @ApiProperty({ description: 'List of languages', enum: LanguageEnum, isArray: true })
  @IsArray({ message: 'Sprachen müssen eine Liste sein' })
  @IsEnum(LanguageEnum, { each: true, message: 'Ungültige Sprache: $value' })
  languages: LanguageEnum[];
}
