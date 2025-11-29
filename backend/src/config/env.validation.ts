import * as Joi from 'joi';

// Centralized environment variable validation for the backend.
// This schema ensures critical configuration is present and provides sensible defaults
// while allowing the app to run in development.
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  FRONTEND_URL: Joi.string().uri().optional(),

  // Database: support DATABASE_URL or discrete config
  DATABASE_URL: Joi.string().uri().optional(),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),
  DATABASE_NAME: Joi.string().default('hairconnekt'),
  DATABASE_SSL: Joi.alternatives()
    .try(Joi.boolean(), Joi.string().valid('true', 'false'))
    .default(false),

  // JWT / Auth
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_SECRET: Joi.string().optional(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  JWT_EXPIRATION: Joi.string().optional(), // legacy naming support
  JWT_REFRESH_EXPIRATION: Joi.string().optional(),

  // Security / password hashing
  PASSWORD_PEPPER: Joi.string().allow('').default(''),
  ARGON2_TIME_COST: Joi.number().integer().min(1).default(3),
  ARGON2_MEMORY_COST: Joi.number().integer().min(32768).default(65536),
  ARGON2_PARALLELISM: Joi.number().integer().min(1).default(1),

  // Verification codes
  VERIFICATION_CODE_LENGTH: Joi.number().integer().min(4).max(10).default(6),
  VERIFICATION_CODE_TTL_MINUTES: Joi.number().integer().min(1).max(60).default(10),
  VERIFICATION_CODE_PEPPER: Joi.string().allow('').default(''),
  // Dev-only verification bypass (for local/testing environments)
  DEV_VERIFICATION_BYPASS: Joi.boolean().default(false),
  DEV_VERIFICATION_CODE: Joi.string().alphanum().min(4).max(10).default('000000'),

  // Email (Resend)
  RESEND_API_KEY: Joi.string().optional(),

  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: Joi.string().optional(),
  TWILIO_AUTH_TOKEN: Joi.string().optional(),
  TWILIO_PHONE_NUMBER: Joi.string().optional(),

  // Payments (Stripe)
  STRIPE_SECRET_KEY: Joi.string().optional(),

  // Storage (Cloudflare R2)
  R2_ENDPOINT: Joi.string().uri().optional(),
  R2_ACCOUNT_ID: Joi.string().optional(),
  R2_ACCESS_KEY_ID: Joi.string().optional(),
  R2_SECRET_ACCESS_KEY: Joi.string().optional(),
  R2_BUCKET: Joi.string().optional(),
  R2_BUCKET_NAME: Joi.string().optional(),
  R2_PUBLIC_BASE_URL: Joi.string().uri().optional(),
  R2_PUBLIC_URL: Joi.string().uri().optional(),
  
  // Redis
  REDIS_URL: Joi.string()
    .pattern(/^(redis|rediss|http|https):\/\/.+/)
    .optional(),
});