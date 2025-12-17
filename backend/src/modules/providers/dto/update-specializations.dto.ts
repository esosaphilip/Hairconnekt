import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SpecializationEnum {
  BOX_BRAIDS = 'Box Braids',
  CORNROWS = 'Cornrows',
  SENEGALESE_TWISTS = 'Senegalese Twists',
  KNOTLESS_BRAIDS = 'Knotless Braids',
  PASSION_TWISTS = 'Passion Twists',
  FAUX_LOCS = 'Faux Locs',
  FULANI_BRAIDS = 'Fulani Braids',
  GHANA_BRAIDS = 'Ghana Braids',
  MARLEY_TWISTS = 'Marley Twists',
  HAVANA_TWISTS = 'Havana Twists',
  GODDESS_BRAIDS = 'Goddess Braids',
  CROCHET_BRAIDS = 'Crochet Braids',
  FEED_IN_BRAIDS = 'Feed-In Braids',
  STITCH_BRAIDS = 'Stitch Braids',
  LEMONADE_BRAIDS = 'Lemonade Braids',
  TRIBAL_BRAIDS = 'Tribal Braids',
  MICRO_BRAIDS = 'Micro Braids',
  TREE_BRAIDS = 'Tree Braids',
}

export class UpdateSpecializationsDto {
  @ApiProperty({ description: 'List of specializations', enum: SpecializationEnum, isArray: true })
  @IsArray({ message: 'Spezialisierungen müssen eine Liste sein' })
  @IsEnum(SpecializationEnum, { each: true, message: 'Ungültige Spezialisierung: $value' })
  specializations: SpecializationEnum[];
}
