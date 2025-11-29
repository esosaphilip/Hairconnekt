import { IsString, IsUrl } from 'class-validator';

export class CreateAccountLinkDto {
  @IsString()
  providerId: string;

  @IsUrl()
  returnUrl: string;

  @IsUrl()
  refreshUrl: string;
}