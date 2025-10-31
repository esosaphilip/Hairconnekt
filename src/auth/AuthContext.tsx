import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { http } from '../api/http';
import { clearAuthBundle, clearTokens, getAuthBundle, getRefreshToken, saveAuthBundle, saveTokens } from './tokenStorage';
import type { Tokens as StorageTokens, PublicUser } from './tokenStorage';

type MaybeTokens = StorageTokens | null;
type User = PublicUser | null;

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'CLIENT' | 'PROVIDER';
};

type AuthContextValue = {
  user: User;
  tokens: MaybeTokens;
  loading: boolean;
  error: string | null;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ user: User; tokens: MaybeTokens }>;
  refreshTokens: () => Promise<MaybeTokens>;
  logout: () => Promise<void>;
  setUser: (u: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ user: User; tokens: MaybeTokens; loading: boolean; error: string | null }>({ user: null, tokens: null, loading: true, error: null });

  useEffect(() => {
    // Load persisted auth bundle on mount
    (async () => {
      const bundle = await getAuthBundle();
      if (bundle?.tokens) await saveTokens(bundle.tokens); // hydrate memory cache for interceptors
      setState({ user: bundle?.user ?? null, tokens: bundle?.tokens ?? null, loading: false, error: null });
    })();
  }, []);

  const login = useCallback(async (emailOrPhone: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await http.post('/auth/login', { emailOrPhone, password });
      const user = res.data?.user || null;
      const tokens = res.data?.tokens || null;
      if (!tokens?.accessToken) throw new Error('Login failed');
      await saveAuthBundle({ user, tokens });
      setState({ user: user || null, tokens, loading: false, error: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      setState({ user: null, tokens: null, loading: false, error: msg });
      throw e;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    // payload: { email, password, firstName, lastName, phone, userType }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await http.post('/auth/register', payload);
      const user = res.data?.user || null;
      const tokens = res.data?.tokens || null;
      if (!tokens?.accessToken) throw new Error('Registration failed');
      await saveAuthBundle({ user, tokens });
      setState({ user: user || null, tokens, loading: false, error: null });
      return { user, tokens };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }, []);

  const refreshTokens = useCallback(async (): Promise<MaybeTokens> => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;
      const res = await http.post('/auth/refresh', { refreshToken }, { headers: { 'x-skip-auth-refresh': 'true' } });
      const tokens = res.data?.tokens || null;
      if (!tokens?.accessToken) return null;
      await saveTokens(tokens);
      // Also update bundle if present
      const bundle = await getAuthBundle();
      if (bundle) await saveAuthBundle({ ...bundle, tokens });
      setState((s) => ({ ...s, tokens }));
      return tokens;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      const refresh = await getRefreshToken();
      if (refresh) {
        // Fire and forget
        http.post('/auth/logout', { refreshToken: refresh }).catch(() => undefined);
      }
    } catch {}
    await clearTokens();
    await clearAuthBundle();
    setState({ user: null, tokens: null, loading: false, error: null });
  }, []);

  const setUser = useCallback(async (u: User): Promise<void> => {
    setState((s) => ({ ...s, user: u }));
    const bundle = await getAuthBundle();
    await saveAuthBundle({ user: u, tokens: bundle?.tokens ?? null });
  }, []);

  const value = { ...state, login, logout, setUser, refreshTokens, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}