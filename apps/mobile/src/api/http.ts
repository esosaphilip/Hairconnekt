import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';
import { getAccessToken, getRefreshToken, saveTokens, getAuthBundle, getPreferredLanguageSetting } from '../auth/tokenStorage';

// Axios instance with sensible defaults to avoid hanging requests
export const http = axios.create({ baseURL: API_BASE_URL, timeout: API_TIMEOUT });
// eslint-disable-next-line no-console
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[HTTP] axios baseURL =', API_BASE_URL);
}

// Global flag to temporarily disable auth behavior (used during logout)
export let authDisabled = false;
export function setAuthDisabled(disabled: boolean) {
  authDisabled = disabled;
}

// Attach Authorization header from secure storage
http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Allow callers to explicitly skip attaching auth
  let skip = false;
  const hdrs = config.headers;
  if (hdrs && typeof hdrs === 'object') {
    const maybe = hdrs['x-skip-auth'];
    skip = maybe === 'true';
  }
  // Also skip auth headers if globally disabled (e.g., during logout)
  if (skip || authDisabled) return config;
  const token = await getAccessToken();
  if (token) {
    const headers = (config.headers && typeof config.headers === 'object') ? (config.headers as any) : {};
    headers['Authorization'] = `Bearer ${token}`;
    config.headers = headers;
  }
  // Attach Accept-Language from persisted auth bundle (preferredLanguage) if available
  try {
    const bundle = await getAuthBundle();
    let lang = bundle?.user?.preferredLanguage || undefined;
    if (!lang) {
      lang = (await getPreferredLanguageSetting()) || undefined;
    }
    if (lang) {
      const headers = (config.headers && typeof config.headers === 'object') ? (config.headers as any) : {};
      headers['Accept-Language'] = lang;
      config.headers = headers;
    }
  } catch {}
  return config;
});

let isRefreshing = false;

// Queue of pending requests waiting for a token refresh
let pendingQueue = [] as Array<{ resolve: (token: string | null) => void; reject: (reason?: unknown) => void }>;

async function refreshTokenFlow() {
  // Prevent concurrent refreshes
  if (isRefreshing) {
    return new Promise((resolve, reject) => pendingQueue.push({ resolve, reject }));
  }
  isRefreshing = true;
  try {
    const r = await getRefreshToken();
    if (!r) throw new Error('No refresh token');
    // Use a direct axios call to avoid our own interceptors
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: r }, {
      headers: { 'x-skip-auth-refresh': 'true' },
    });
    const newAccess = res.data?.tokens?.accessToken;
    const newRefresh = res.data?.tokens?.refreshToken;
    if (!newAccess) throw new Error('No access token in refresh response');
    await saveTokens({ accessToken: newAccess, refreshToken: newRefresh });
    pendingQueue.forEach((p) => p.resolve(newAccess));
    return newAccess;
  } catch (err) {
    pendingQueue.forEach((p) => p.reject(err));
    return null;
  } finally {
    pendingQueue = [];
    isRefreshing = false;
  }
}

// Allow auth layer to abort any refresh-in-progress during logout
export function abortAuthRefresh() {
  try {
    pendingQueue.forEach((p) => p.reject(new Error('Auth refresh aborted')));
  } catch {}
  pendingQueue = [];
  isRefreshing = false;
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error?.config as InternalAxiosRequestConfig | undefined;
    const status = error?.response?.status;
    let skip = false;
    const hdrs = config?.headers;
    if (hdrs && typeof hdrs === 'object') {
      const maybe = hdrs['x-skip-auth-refresh'];
      skip = maybe === 'true';
    }

    // Skip refresh if globally disabled (e.g., after logout)
    if (status === 401 && config && !(config as any)._retry && !skip && !authDisabled) {
      (config as any)._retry = true;
      try {
        const newToken = await refreshTokenFlow();
        if (!newToken) throw error;
        const headers = (config.headers && typeof config.headers === 'object') ? (config.headers as any) : {};
        headers['Authorization'] = `Bearer ${newToken}`;
        config.headers = headers;
        return http(config);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);
