/**
 * Centralized API configuration and endpoints
 * NO hardcoded URLs anywhere else in the codebase
 */

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || '',
  TIMEOUT: 15000,
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      GOOGLE: '/auth/google',
      APPLE: '/auth/apple',
    },
    // Providers
    PROVIDERS: {
      ME: '/providers/me',
      DASHBOARD: '/providers/dashboard',
      NEARBY: '/providers/nearby',
      SEARCH: '/providers/search',
      PUBLIC: (id: string) => `/providers/public/${id}`,
      SETTINGS: '/providers/settings',
      CLIENTS: '/providers/clients',
    },
    // Services
    // NOTE: Backend currently only has POST /services and GET /services/provider
    // UPDATE, DELETE, and PATCH endpoints need to be added to backend
    SERVICES: {
      LIST: '/providers/me/services', // GET - Correct endpoint
      CREATE: '/providers/me/services', // POST - Correct endpoint
      UPDATE: (id: string) => `/providers/me/services/${id}`, // PATCH
      DELETE: (id: string) => `/providers/me/services/${id}`, // DELETE
      TOGGLE: (id: string) => `/providers/me/services/${id}`, // PATCH
    },
    // Appointments
    APPOINTMENTS: {
      CLIENT: '/appointments/client',
      PROVIDER: '/appointments/provider',
      CREATE: '/appointments',
      UPDATE: (id: string) => `/appointments/${id}`,
      CANCEL: (id: string) => `/appointments/${id}/cancel`,
      RESCHEDULE: (id: string) => `/appointments/${id}/reschedule`,
    },
    // Vouchers
    // NOTE: Voucher endpoints need to be verified/implemented in backend
    VOUCHERS: {
      LIST: '/providers/vouchers', // GET - TODO: verify backend endpoint
      CREATE: '/providers/vouchers', // POST - TODO: verify backend endpoint
      UPDATE: (id: string) => `/providers/vouchers/${id}`, // PUT/PATCH - TODO: verify backend endpoint
      DELETE: (id: string) => `/providers/vouchers/${id}`, // DELETE - TODO: verify backend endpoint
    },
    // Favorites
    FAVORITES: {
      LIST: '/favorites',
      ADD: '/favorites',
      REMOVE: (id: string) => `/favorites/${id}`,
    },
    // Messages
    MESSAGES: {
      CONVERSATIONS: '/messages/conversations',
      MESSAGES: (conversationId: string) => `/messages/conversations/${conversationId}`,
      SEND: (conversationId: string) => `/messages/conversations/${conversationId}/messages`,
    },
    // Payments
    PAYMENTS: {
      METHODS: '/payments/methods',
      ADD_METHOD: '/payments/methods',
      DELETE_METHOD: (id: string) => `/payments/methods/${id}`,
      PAYOUT_REQUEST: '/payments/payout-request',
      TRANSACTIONS: '/payments/transactions',
    },
  },
} as const;

