/**
 * Centralized validation rules and messages
 * NO hardcoded validation logic anywhere else in the codebase
 */

import { APP_CONFIG } from './config';

export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: APP_CONFIG.VALIDATION.EMAIL_REGEX,
    MESSAGE: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
  },
  PHONE: {
    PATTERN: APP_CONFIG.VALIDATION.PHONE_REGEX,
    MESSAGE: 'Bitte geben Sie eine gültige Telefonnummer ein',
  },
  PASSWORD: {
    MIN_LENGTH: APP_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH,
    MAX_LENGTH: APP_CONFIG.VALIDATION.MAX_PASSWORD_LENGTH,
    MESSAGE: `Das Passwort muss zwischen ${APP_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} und ${APP_CONFIG.VALIDATION.MAX_PASSWORD_LENGTH} Zeichen lang sein`,
  },
  REQUIRED: {
    MESSAGE: 'Dieses Feld ist erforderlich',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MESSAGE: 'Der Name muss zwischen 2 und 50 Zeichen lang sein',
  },
  SERVICE: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 100,
    PRICE_MIN: 0,
    PRICE_MAX: 10000, // 100 EUR in cents
    DURATION_MIN: 15, // minutes
    DURATION_MAX: 480, // 8 hours in minutes
  },
} as const;

export function validateEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
}

export function validatePhone(phone: string): boolean {
  return VALIDATION_RULES.PHONE.PATTERN.test(phone);
}

export function validatePassword(password: string): boolean {
  return (
    password.length >= VALIDATION_RULES.PASSWORD.MIN_LENGTH &&
    password.length <= VALIDATION_RULES.PASSWORD.MAX_LENGTH
  );
}

export function validateRequired(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

