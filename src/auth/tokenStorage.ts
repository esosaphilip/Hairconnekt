import * as SecureStore from 'expo-secure-store';
// Simple runtime check for web environment
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

function lsGetItem(key: string): string | null {
  try {
    if (isWeb && window.localStorage) {
      const v = window.localStorage.getItem(key);
      return v ?? null;
    }
  } catch {}
  return null;
}

function lsSetItem(key: string, value: string): void {
  try {
    if (isWeb && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {}
}

function lsRemoveItem(key: string): void {
  try {
    if (isWeb && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {}
}

// Key names aligned with existing web app for consistency
export const ACCESS_TOKEN_KEY = 'hc_access_token';
export const REFRESH_TOKEN_KEY = 'hc_refresh_token';
export const AUTH_BUNDLE_KEY = 'hc_auth'; // { user, tokens }

// Types used across auth storage
export type Tokens = { accessToken: string; refreshToken?: string | null };
export type PublicUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: string | null;
  // Verification flags used across mobile screens
  emailVerified?: boolean;
  phoneVerified?: boolean;
  // Preferred app language (e.g., 'de', 'en')
  preferredLanguage?: string | null;
};
export type AuthBundle = { user?: PublicUser | null; tokens?: Tokens | null };

// In-memory cache to avoid frequent async calls
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let memoryAuthBundle: AuthBundle | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (memoryAccessToken) return memoryAccessToken;
  // Fallback to auth bundle in memory (helps with HMR reloads)
  if (memoryAuthBundle?.tokens?.accessToken) {
    memoryAccessToken = memoryAuthBundle.tokens.accessToken;
    return memoryAccessToken;
  }
  try {
    const v = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (v) {
      memoryAccessToken = v;
      return memoryAccessToken;
    }
  } catch {}
  // Web fallback: localStorage
  const ls = lsGetItem(ACCESS_TOKEN_KEY);
  if (ls) {
    memoryAccessToken = ls;
    return memoryAccessToken;
  }
  return null;
}

export async function getRefreshToken(): Promise<string | null> {
  if (memoryRefreshToken) return memoryRefreshToken;
  // Fallback to auth bundle in memory (helps with HMR reloads)
  if (memoryAuthBundle?.tokens?.refreshToken) {
    memoryRefreshToken = memoryAuthBundle.tokens.refreshToken || null;
    if (memoryRefreshToken) return memoryRefreshToken;
  }
  try {
    const v = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (v) {
      memoryRefreshToken = v;
      return memoryRefreshToken;
    }
  } catch {}
  // Web fallback: localStorage
  const ls = lsGetItem(REFRESH_TOKEN_KEY);
  if (ls) {
    memoryRefreshToken = ls;
    return memoryRefreshToken;
  }
  return null;
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  memoryAccessToken = tokens.accessToken || null;
  memoryRefreshToken = tokens.refreshToken || null;
  try {
    if (tokens.accessToken) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {}
  // Web fallback: persist to localStorage so tokens survive HMR reloads
  try {
    if (tokens.accessToken) lsSetItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) lsSetItem(REFRESH_TOKEN_KEY, tokens.refreshToken as string);
  } catch {}
}

export async function clearTokens(): Promise<void> {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {}
  // Web fallback
  lsRemoveItem(ACCESS_TOKEN_KEY);
  lsRemoveItem(REFRESH_TOKEN_KEY);
}

export async function getAuthBundle(): Promise<AuthBundle | null> {
  if (memoryAuthBundle) return memoryAuthBundle;
  try {
    const raw = await SecureStore.getItemAsync(AUTH_BUNDLE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthBundle;
      memoryAuthBundle = parsed;
      return parsed;
    }
  } catch {}
  // Web fallback
  const ls = lsGetItem(AUTH_BUNDLE_KEY);
  if (ls) {
    try {
      const parsed = JSON.parse(ls) as AuthBundle;
      memoryAuthBundle = parsed;
      return parsed;
    } catch {}
  }
  return null;
}

export async function saveAuthBundle(bundle: AuthBundle): Promise<void> {
  memoryAuthBundle = bundle;
  try {
    await SecureStore.setItemAsync(AUTH_BUNDLE_KEY, JSON.stringify(bundle));
    // Also keep tokens keys up to date
    const tokens = bundle?.tokens || null;
    if (tokens) await saveTokens(tokens);
  } catch {}
  // Web fallback
  try {
    lsSetItem(AUTH_BUNDLE_KEY, JSON.stringify(bundle));
  } catch {}
}

export async function clearAuthBundle(): Promise<void> {
  memoryAuthBundle = null;
  try {
    await SecureStore.deleteItemAsync(AUTH_BUNDLE_KEY);
  } catch {}
  // Web fallback
  lsRemoveItem(AUTH_BUNDLE_KEY);
}

// Optional helpers to persist language for unauthenticated users
// Keeping in the same storage module for convenience
export const LANGUAGE_KEY = 'hc_lang';
export const ONBOARDING_COMPLETE_KEY = 'hc_onboarding_done';

export async function getPreferredLanguageSetting(): Promise<string | null> {
  // First try from in-memory bundle (logged-in)
  if (memoryAuthBundle?.user?.preferredLanguage) {
    return memoryAuthBundle.user.preferredLanguage || null;
  }
  // SecureStore
  try {
    const raw = await SecureStore.getItemAsync(LANGUAGE_KEY);
    if (raw) return raw;
  } catch {}
  // Web fallback
  const ls = lsGetItem(LANGUAGE_KEY);
  if (ls) return ls;
  return null;
}

export async function savePreferredLanguageSetting(lang: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
  } catch {}
  lsSetItem(LANGUAGE_KEY, lang);
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await SecureStore.setItemAsync(ONBOARDING_COMPLETE_KEY, 'true');
  } catch {}
  lsSetItem(ONBOARDING_COMPLETE_KEY, 'true');
}

export async function getOnboardingComplete(): Promise<boolean> {
  try {
    const raw = await SecureStore.getItemAsync(ONBOARDING_COMPLETE_KEY);
    if (raw) return raw === 'true';
  } catch {}
  const ls = lsGetItem(ONBOARDING_COMPLETE_KEY);
  if (ls) return ls === 'true';
  return false;
}