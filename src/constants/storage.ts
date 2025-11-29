/**
 * Centralized AsyncStorage keys
 * NO hardcoded storage keys anywhere else in the codebase
 */

export const STORAGE_KEYS = {
  AUTH: {
    TOKEN: '@hairconnekt:auth:token',
    REFRESH_TOKEN: '@hairconnekt:auth:refreshToken',
    USER: '@hairconnekt:auth:user',
    BUNDLE: '@hairconnekt:auth:bundle',
  },
  PREFERENCES: {
    LANGUAGE: '@hairconnekt:preferences:language',
    THEME: '@hairconnekt:preferences:theme',
    NOTIFICATIONS: '@hairconnekt:preferences:notifications',
  },
  CACHE: {
    PROVIDERS: '@hairconnekt:cache:providers',
    SERVICES: '@hairconnekt:cache:services',
    RECENT_SEARCHES: '@hairconnekt:cache:recentSearches',
  },
} as const;

