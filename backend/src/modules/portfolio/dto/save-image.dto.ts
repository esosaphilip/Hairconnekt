import { IsUUID } from 'class-validator';

export class SaveImageDto {
  @IsUUID()
  userId: string;
}