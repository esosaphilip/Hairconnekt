export const jwtConfig = () => ({
  accessTokenSecret:
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'CHANGE_ME',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'CHANGE_ME',
  accessTokenExpiresIn:
    process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRATION || '15m',
  refreshTokenExpiresIn:
    process.env.JWT_REFRESH_EXPIRES_IN ||
    process.env.JWT_REFRESH_EXPIRATION ||
    '7d',
});