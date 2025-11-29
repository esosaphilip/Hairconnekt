import { IsIn, IsNumber, IsString, Max, Min } from 'class-validator';
import { IbanCountryLength, IbanCurrency, IbanFormat } from '../../../common/validators/iban.validator';

export class RequestPayoutDto {
  // Amount in major currency units (e.g., euros). Range constraints applied.
  @IsNumber()
  @Min(1)
  @Max(100000)
  amount: number;

  @IsString()
  @IsIn(['eur'])
  currency: string;

  @IsString()
  @IbanFormat()
  @IbanCountryLength()
  @IbanCurrency()
  iban: string;
}