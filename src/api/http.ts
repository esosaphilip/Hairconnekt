import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getAccessToken, getRefreshToken, saveTokens } from '../auth/tokenStorage';

// Axios instance
export const http = axios.create({ baseURL: API_BASE_URL });

// Attach Authorization header from secure storage
http.interceptors.request.use(async (config) => {
  // Allow callers to explicitly skip attaching auth
  let skip = false;
  const hdrs = config.headers;
  if (hdrs && typeof hdrs === 'object') {
    const maybe = hdrs['x-skip-auth'];
    skip = maybe === 'true';
  }
  if (skip) return config;
  const token = await getAccessToken();
  if (token) {
    const headers = ((config.headers && typeof config.headers === 'object') ? config.headers : {}) as any;
    headers['Authorization'] = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

let isRefreshing = false;

// Queue of pending requests waiting for a token refresh
let pendingQueue = [] as Array<{ resolve: (token: string | null) => void; reject: (reason?: any) => void }>;

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

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error?.config || undefined;
    const status = error?.response?.status;
    let skip = false;
    const hdrs = config?.headers;
    if (hdrs && typeof hdrs === 'object') {
      const maybe = hdrs['x-skip-auth-refresh'];
      skip = maybe === 'true';
    }

    if (status === 401 && config && !config._retry && !skip) {
      config._retry = true;
      try {
        const newToken = await refreshTokenFlow();
        if (!newToken) throw error;
        const headers = ((config.headers && typeof config.headers === 'object') ? config.headers : {}) as any;
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