import React, { createContext, useCallback, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { http, setAuthDisabled, abortAuthRefresh } from '../api/http';
import { on } from '../services/eventBus';
import { clearAuthBundle, clearTokens, getAuthBundle, getRefreshToken, saveAuthBundle, saveTokens } from './tokenStorage';
import type { AuthBundle, Tokens, PublicUser } from './tokenStorage';
import type { AuthContextValue } from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthState = { user: PublicUser | null; tokens: Tokens | null; loading: boolean; error: string | null };

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ user: null, tokens: null, loading: true, error: null });

  useEffect(() => {
    // Load persisted auth bundle on mount
    (async () => {
      // eslint-disable-next-line no-console
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Boot: loading persisted auth bundle…');
      // Safety: avoid rare hangs on SecureStore by racing with a timeout
      const timeoutMs = 3500;
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
      let bundle: AuthBundle | null = null;
      try {
        bundle = await Promise.race([getAuthBundle(), timeout]);
      } catch (e) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Boot: getAuthBundle error ->', e);
        bundle = null;
      }
      if (bundle?.tokens) await saveTokens(bundle.tokens);
      setState({ user: bundle?.user ?? null, tokens: bundle?.tokens ?? null, loading: false, error: null });
      // eslint-disable-next-line no-console
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Boot: done. user =', bundle?.user ? bundle.user.userType : 'null', `(timeout ${timeoutMs}ms)`);
    })();
  }, []);

  useEffect(() => {
    const off = on('session_expired', async () => {
      try {
        await clearTokens();
        await clearAuthBundle();
      } catch {}
      setState({ user: null, tokens: null, loading: false, error: 'Session abgelaufen' });
    });
    return off;
  }, []);

  const login = useCallback(async (emailOrPhone: string, password: string): Promise<{ user: PublicUser | null; tokens: Tokens }> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // eslint-disable-next-line no-console
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Login: POST /auth/login');
      // Ensure we do not attach any stale Authorization header during public login
      const res = await http.post('/auth/login', { emailOrPhone, password }, { headers: { 'x-skip-auth': 'true' } });
      const user: PublicUser | null = (res.data?.user as PublicUser) || null;
      const tokens: Tokens | null = (res.data?.tokens as Tokens) || null;
      if (!tokens?.accessToken) throw new Error('Login failed');
      await saveAuthBundle({ user, tokens });
      setState({ user: user || null, tokens, loading: false, error: null });
      setAuthDisabled(false);
      // eslint-disable-next-line no-console
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Login: success. userType =', user?.userType);
      // Return the authenticated user and tokens so callers can make immediate decisions (e.g., role gating)
      return { user, tokens: tokens as Tokens };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      setState({ user: null, tokens: null, loading: false, error: msg });
      // eslint-disable-next-line no-console
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Login: error ->', msg);
      throw e;
    }
  }, []);

  const register = useCallback(async (payload: Record<string, unknown>): Promise<{ user: PublicUser | null; tokens: Tokens }> => {
    // payload: { email, password, firstName, lastName, phone, userType }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Ensure we do not attach any stale Authorization header during public registration
      const res = await http.post('/auth/register', payload, { headers: { 'x-skip-auth': 'true' } });
      const user: PublicUser | null = (res.data?.user as PublicUser) || null;
      const tokens: Tokens | null = (res.data?.tokens as Tokens) || null;
      if (!tokens?.accessToken) throw new Error('Registration failed');
      await saveAuthBundle({ user, tokens });
      setState({ user: user || null, tokens, loading: false, error: null });
      setAuthDisabled(false);
      return { user, tokens: tokens as Tokens };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }, []);

  const refreshTokens = useCallback(async (): Promise<Tokens | null> => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;
      const res = await http.post('/auth/refresh', { refreshToken }, { headers: { 'x-skip-auth-refresh': 'true' } });
      const tokens: Tokens | null = (res.data?.tokens as Tokens) || null;
      if (!tokens?.accessToken) return null;
      await saveTokens(tokens);
      // Also update bundle if present
      const bundle = await getAuthBundle();
      if (bundle) await saveAuthBundle({ ...bundle, tokens });
      setState((s) => ({ ...s, tokens }));
      return tokens as Tokens;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    // eslint-disable-next-line no-console
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Logout: start');
    // Prevent interceptors from attempting auth while we clear state
    setAuthDisabled(true);
    abortAuthRefresh();
    try {
      const refresh = await getRefreshToken();
      if (refresh) {
        // Fire and forget, but log errors
        await http
          .post(
            '/auth/logout',
            { refreshToken: refresh },
            { headers: { 'x-skip-auth': 'true', 'x-skip-auth-refresh': 'true' } },
          )
          .catch((e) => {
            if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Logout: backend call failed ->', e);
          });
      }
    } catch (e) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Logout: getRefreshToken failed ->', e);
    }
    await clearTokens();
    await clearAuthBundle();
    setState({ user: null, tokens: null, loading: false, error: null });
    // eslint-disable-next-line no-console
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] Logout: completed (user=null, tokens=null)');
  }, []);

  const setUser = useCallback(async (u: PublicUser | null): Promise<void> => {
    setState((s) => ({ ...s, user: u }));
    const bundle = await getAuthBundle();
    await saveAuthBundle({ user: u, tokens: bundle?.tokens ?? null });
  }, []);

  const value: AuthContextValue = { ...state, login, logout, setUser, refreshTokens, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
