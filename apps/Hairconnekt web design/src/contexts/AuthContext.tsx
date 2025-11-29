import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/http';

/**
 * @typedef {import('@/services/http').Tokens} Tokens
 * @typedef {import('@/services/http').PublicUser} PublicUser
 * @typedef {{ user: PublicUser|null, tokens: Tokens|null, loading: boolean, error: string|null }} AuthState
 * @typedef {AuthState & { login: (emailOrPhone: string, password: string) => Promise<void>, register: (payload: any) => Promise<void>, logout: () => void, updateUser: (partial: Partial<PublicUser>) => void }} AuthContextValue
 */

/** @type {React.Context<AuthContextValue | undefined>} */
const AuthContext = createContext(undefined);

/**
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider(props) {
  const { children } = props;
  /** @type {AuthState} */
  const initialAuthState = { user: null, tokens: null, loading: true, error: null };
  const [state, setState] = useState(initialAuthState);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('hc_auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ user: parsed.user || null, tokens: parsed.tokens || null, loading: false, error: null });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  /**
   * @param {PublicUser|null} user
   * @param {Tokens|null} tokens
   */
  const persist = (user, tokens) => {
    try {
      if (tokens?.accessToken) localStorage.setItem('hc_access_token', tokens.accessToken);
      if (tokens?.refreshToken) localStorage.setItem('hc_refresh_token', tokens.refreshToken);
      localStorage.setItem('hc_auth', JSON.stringify({ user, tokens }));
    } catch {}
  };

  /**
   * @param {string} emailOrPhone
   * @param {string} password
   */
  const login = async (emailOrPhone, password) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      /** @type {{ user: PublicUser, tokens: Tokens }} */
      const res = await api.post(`/auth/login`, { emailOrPhone, password });
      persist(res.user, res.tokens);
      setState({ user: res.user, tokens: res.tokens, loading: false, error: null });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e?.message || 'Login failed' }));
      throw e;
    }
  };

  /**
   * @param {any} payload
   */
  const register = async (payload) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      /** @type {{ user: PublicUser, tokens: Tokens }} */
      const res = await api.post(`/auth/register`, payload);
      persist(res.user, res.tokens);
      setState({ user: res.user, tokens: res.tokens, loading: false, error: null });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e?.message || 'Registration failed' }));
      throw e;
    }
  };

  const logout = () => {
    try {
      const refresh = localStorage.getItem('hc_refresh_token');
      if (refresh) {
        api.post(`/auth/logout`, { refreshToken: refresh }).catch(() => undefined);
      }
      localStorage.removeItem('hc_access_token');
      localStorage.removeItem('hc_refresh_token');
      localStorage.removeItem('hc_auth');
    } catch {}
    setState({ user: null, tokens: null, loading: false, error: null });
  };

  /**
   * Update current user in auth state and persist to localStorage
   * @param {Partial<PublicUser>} partial
   */
  const updateUser = (partial) => {
    setState((s) => {
      const nextUser = { ...(s.user || {}), ...partial };
      persist(nextUser, s.tokens);
      return { ...s, user: nextUser };
    });
  };

  /** @type {AuthContextValue} */
  const value = useMemo(() => ({ ...state, login, register, logout, updateUser }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}