// Lightweight HTTP client using fetch with JSON handling and auth header support
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Use a safe access for Vite's environment to avoid TypeScript-only assertions
const BASE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:3000';

// Safely extract a 'message' string from unknown JSON payloads
function extractMessage(data: unknown): string | undefined {
  if (data && typeof data === 'object') {
    const maybe = (data as Record<string, unknown>).message;
    if (typeof maybe === 'string') return maybe;
  }
  return undefined;
}

function getAccessToken() {
  try {
    return localStorage.getItem('hc_access_token') || '';
  } catch {
    return '';
  }
}

// Provide a default generic to improve inference when consumers don't specify T
// Adds automatic token refresh on 401 responses using stored refresh token
async function request<T = any>(
  path: string,
  options: RequestInit & { query?: Record<string, string | number | boolean>; skipAuthRefresh?: boolean } = {}
): Promise<T> {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
  if (options.query) {
    Object.entries(options.query).forEach(([k, v]) => url.searchParams.append(k, String(v)));
  }
  const token = getAccessToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res = await fetch(url.toString(), {
    ...options,
    headers,
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON response
  }
  if (!res.ok) {
    // Attempt refresh on 401 if we have a refresh token and this isn't the refresh call itself
    if (res.status === 401 && !options.skipAuthRefresh) {
      try {
        const refreshToken = localStorage.getItem('hc_refresh_token');
        if (refreshToken) {
          const refreshRes = await request<{ tokens: Tokens }>(
            '/auth/refresh',
            { method: 'POST', body: JSON.stringify({ refreshToken }), skipAuthRefresh: true }
          );
          const newAccess = refreshRes?.tokens?.accessToken;
          const newRefresh = refreshRes?.tokens?.refreshToken;
          if (newAccess) {
            // Persist new tokens
            try {
              localStorage.setItem('hc_access_token', newAccess);
              if (newRefresh) localStorage.setItem('hc_refresh_token', newRefresh);
              // Also update cached auth bundle if present
              const rawAuth = localStorage.getItem('hc_auth');
              if (rawAuth) {
                const parsedAuth = JSON.parse(rawAuth);
                parsedAuth.tokens = { ...(parsedAuth.tokens || {}), accessToken: newAccess, refreshToken: newRefresh || parsedAuth.tokens?.refreshToken };
                localStorage.setItem('hc_auth', JSON.stringify(parsedAuth));
              }
            } catch {}
            // Retry original request once with new Authorization header
            const retryHeaders: HeadersInit = {
              ...headers,
              Authorization: `Bearer ${newAccess}`,
            };
            res = await fetch(url.toString(), { ...options, headers: retryHeaders });
            const retryText = await res.text();
            let retryJson: unknown = null;
            try {
              retryJson = retryText ? JSON.parse(retryText) : null;
            } catch {}
            if (!res.ok) {
              const message = extractMessage(retryJson) || res.statusText || 'Request failed';
              throw new Error(message);
            }
            return retryJson as T;
          }
        }
      } catch (err) {
        // Fall through to original error
      }
    }
    const message = extractMessage(json) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return json as T;
}

export const api = {
  // Default generics ensure JS/TS callers without explicit <T> receive 'any' instead of 'unknown'
  get: <T = any>(path: string, query?: Record<string, string | number | boolean>) => request<T>(path, { method: 'GET', query }),
  post: <T = any>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
  // For multipart/form-data uploads
  postForm: <T = any>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
  baseUrl: BASE_URL,
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type PublicUser = {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  userType: 'client' | 'provider' | string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLogin?: string;
};