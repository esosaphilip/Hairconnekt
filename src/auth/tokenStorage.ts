import * as SecureStore from 'expo-secure-store';

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
};
export type AuthBundle = { user?: PublicUser | null; tokens?: Tokens | null };

// In-memory cache to avoid frequent async calls
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let memoryAuthBundle: AuthBundle | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (memoryAccessToken) return memoryAccessToken;
  try {
    const v = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    memoryAccessToken = v || null;
    return memoryAccessToken;
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (memoryRefreshToken) return memoryRefreshToken;
  try {
    const v = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    memoryRefreshToken = v || null;
    return memoryRefreshToken;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  memoryAccessToken = tokens.accessToken || null;
  memoryRefreshToken = tokens.refreshToken || null;
  try {
    if (tokens.accessToken) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {
    // ignore
  }
}

export async function clearTokens(): Promise<void> {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function getAuthBundle(): Promise<AuthBundle | null> {
  if (memoryAuthBundle) return memoryAuthBundle;
  try {
    const raw = await SecureStore.getItemAsync(AUTH_BUNDLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthBundle;
    memoryAuthBundle = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveAuthBundle(bundle: AuthBundle): Promise<void> {
  memoryAuthBundle = bundle;
  try {
    await SecureStore.setItemAsync(AUTH_BUNDLE_KEY, JSON.stringify(bundle));
    // Also keep tokens keys up to date
    const tokens = bundle?.tokens || null;
    if (tokens) await saveTokens(tokens);
  } catch {
    // ignore
  }
}

export async function clearAuthBundle(): Promise<void> {
  memoryAuthBundle = null;
  try {
    await SecureStore.deleteItemAsync(AUTH_BUNDLE_KEY);
  } catch {
    // ignore
  }
}