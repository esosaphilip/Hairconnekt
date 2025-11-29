/**
 * Centralized app configuration
 * NO hardcoded config values anywhere else in the codebase
 */

export const APP_CONFIG = {
  NAME: 'HairConnekt',
  VERSION: '1.0.0',
  MINIMUM_PAYOUT_CENTS: 5000, // 50 EUR default, should be fetched from backend
  PAYOUT_PROCESSING_DAYS: 3,
  CURRENCY: 'EUR',
  DEFAULT_LANGUAGE: 'de',
  SUPPORTED_LANGUAGES: ['de', 'en'] as const,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
  CACHE: {
    PROVIDERS_TTL: 5 * 60 * 1000, // 5 minutes
    SERVICES_TTL: 10 * 60 * 1000, // 10 minutes
  },
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

