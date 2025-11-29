import { IsString } from 'class-validator';

export class LikeImageDto {
  @IsString()
  imageId: string;

  @IsString()
  userId: string;
}