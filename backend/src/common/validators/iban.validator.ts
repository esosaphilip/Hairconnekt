import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

const COUNTRY_IBAN_LENGTH: Record<string, number> = {
  DE: 22, FR: 27, GB: 22, ES: 24, IT: 27, NL: 18, BE: 16, PT: 25, IE: 22, AT: 20,
  FI: 18, GR: 27, LU: 20, CY: 28, MT: 31, SK: 24, SI: 19, LV: 21, LT: 20, EE: 20,
};

const EUROZONE_COUNTRIES = new Set(Object.keys(COUNTRY_IBAN_LENGTH));

export function sanitizeIban(iban: string): string {
  return (iban || '').replace(/\s+/g, '').toUpperCase();
}

function alphanumToDigits(s: string): string {
  return s
    .split('')
    .map((ch) => {
      if (ch >= 'A' && ch <= 'Z') {
        return (ch.charCodeAt(0) - 55).toString(); // A=10..Z=35
      }
      return ch;
    })
    .join('');
}

export function isValidIban(iban: string): boolean {
  const s = sanitizeIban(iban);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const moved = s.slice(4) + s.slice(0, 4);
  const digits = alphanumToDigits(moved);
  // compute mod 97 iteratively to avoid big integers
  let remainder = 0;
  for (let i = 0; i < digits.length; i++) {
    remainder = (remainder * 10 + Number(digits[i])) % 97;
  }
  return remainder === 1;
}

@ValidatorConstraint({ name: 'ibanFormat', async: false })
export class IbanFormatConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') return false;
    return isValidIban(value);
  }
  defaultMessage() {
    return 'IBAN is invalid. Please provide a valid IBAN.';
  }
}

@ValidatorConstraint({ name: 'ibanCountryLength', async: false })
export class IbanCountryLengthConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') return false;
    const s = sanitizeIban(value);
    const cc = s.slice(0, 2);
    const expected = COUNTRY_IBAN_LENGTH[cc];
    if (!expected) return true; // allow countries we don't validate length for
    return s.length === expected;
  }
  defaultMessage(args?: ValidationArguments) {
    const s = sanitizeIban(String(args?.value ?? ''));
    const cc = s.slice(0, 2);
    const expected = COUNTRY_IBAN_LENGTH[cc];
    return expected
      ? `IBAN length for country ${cc} must be ${expected} characters.`
      : 'IBAN country not recognized.';
  }
}

@ValidatorConstraint({ name: 'ibanCurrency', async: false })
export class IbanCurrencyConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') return false;
    const obj: any = args.object || {};
    const currency: string = obj.currency;
    const cc = sanitizeIban(value).slice(0, 2);
    if (!currency) return true; // currency validation handled elsewhere
    if (currency.toLowerCase() === 'eur') {
      return EUROZONE_COUNTRIES.has(cc);
    }
    // For non-eur, skip strict country check for now
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    const obj: any = args.object || {};
    const cc = sanitizeIban(String(args.value)).slice(0, 2);
    return `IBAN country ${cc} is not valid for currency ${obj.currency}.`;
  }
}

export function IbanFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IbanFormat',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IbanFormatConstraint,
    });
  };
}

export function IbanCountryLength(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IbanCountryLength',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IbanCountryLengthConstraint,
    });
  };
}

export function IbanCurrency(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IbanCurrency',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IbanCurrencyConstraint,
    });
  };
}