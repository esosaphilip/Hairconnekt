import { IsUUID } from 'class-validator';

export class UserContextDto {
  @IsUUID()
  userId: string;
}