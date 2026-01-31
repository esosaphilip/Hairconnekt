import React, { createContext, useCallback, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { http, setAuthDisabled, abortAuthRefresh } from '../api/http';
import { on, off } from '../services/eventBus';
import { clearAuthBundle, clearTokens, getAuthBundle, getRefreshToken, saveAuthBundle, saveTokens } from './tokenStorage';
import type { AuthBundle, Tokens, PublicUser } from './tokenStorage';
import type { AuthContextValue } from './types';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { normalizeUrl } from '@/utils/url';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthState = { user: PublicUser | null; tokens: Tokens | null; loading: boolean; error: string | null };

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ user: null, tokens: null, loading: true, error: null });

  // Helper to sync FCM token
  const syncFcm = useCallback(async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        // We use x-skip-auth: false (default) handled by interceptor
        await http.patch('/users/fcm-token', { fcmToken: token });
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] FCM TokenSynced:', token);
      }
    } catch (e) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.log('[Auth] FCM Sync Error:', e);
    }
  }, []);

  useEffect(() => {
    // Load persisted auth bundle on mount
    let mounted = true;
    (async () => {
      try {
        const bundle = await getAuthBundle();
        if (mounted) {
          if (bundle?.user?.profilePictureUrl) {
            bundle.user.profilePictureUrl = normalizeUrl(bundle.user.profilePictureUrl);
          }
          if (bundle?.user && bundle?.tokens) {
            // Sync in background
            syncFcm();
          }
          setState({ user: bundle?.user ?? null, tokens: bundle?.tokens ?? null, loading: false, error: null });
        }
      } catch (e) {
        if (mounted) setState({ user: null, tokens: null, loading: false, error: null });
      }
    })();
    return () => { mounted = false; };
  }, [syncFcm]);

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
    };
    on('session_expired', handleSessionExpired);
    return () => {
      off('session_expired', handleSessionExpired);
    };
  }, []);

  const setSession = useCallback(async (user: PublicUser, tokens: Tokens) => {
    if (user?.profilePictureUrl) {
      user.profilePictureUrl = normalizeUrl(user.profilePictureUrl);
    }
    await saveAuthBundle({ user, tokens });
    setState({ user, tokens, loading: false, error: null });
    setAuthDisabled(false);
    syncFcm();
  }, [syncFcm]);

  const login = useCallback(async (emailOrPhone: string, password: string, deviceId?: string): Promise<{ user: PublicUser | null; tokens: Tokens }> => {
    try {
      const { data } = await http.post('/auth/login', { emailOrPhone, password, deviceId });
      const { user, tokens } = data; // Assuming backend returns { user, tokens }

      if (user?.profilePictureUrl) {
        user.profilePictureUrl = normalizeUrl(user.profilePictureUrl);
      }

      await saveAuthBundle({ user, tokens });
      setState({ user, tokens, loading: false, error: null });
      setAuthDisabled(false);
      syncFcm();
      return { user, tokens };
    } catch (e: any) {
      throw e;
    }
  }, [syncFcm]);

  const register = useCallback(async (payload: Record<string, unknown>): Promise<{ user: PublicUser | null; tokens: Tokens }> => {
    try {
      const { data } = await http.post('/auth/register', payload);
      const { user, tokens } = data;

      if (user?.profilePictureUrl) {
        user.profilePictureUrl = normalizeUrl(user.profilePictureUrl);
      }

      await saveAuthBundle({ user, tokens });
      setState({ user: user || null, tokens, loading: false, error: null });
      setAuthDisabled(false);
      syncFcm();
      return { user, tokens: tokens as Tokens };
    } catch (e: any) {
      throw e;
    }
  }, [syncFcm]);

  const logout = useCallback(async () => {
    await clearAuthBundle();
    abortAuthRefresh();
    setAuthDisabled(true); // Stop retries
    setState({ user: null, tokens: null, loading: false, error: null });
  }, []);

  const refreshTokens = useCallback(async (): Promise<Tokens | null> => {
    // Logic handled via interceptor generally, but if exposed:
    const currentRefresh = await getRefreshToken();
    if (!currentRefresh) throw new Error('No refresh token');
    // Implement if needed
    return null;
  }, []);

  const setUser = useCallback(async (user: PublicUser | null) => {
    if (user?.profilePictureUrl) {
      user.profilePictureUrl = normalizeUrl(user.profilePictureUrl);
    }
    setState(s => {
      const newState = { ...s, user };
      saveAuthBundle({ user: newState.user, tokens: newState.tokens });
      return newState;
    });
  }, []);

  const value: AuthContextValue = { ...state, login, logout, setUser, refreshTokens, register, setSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
