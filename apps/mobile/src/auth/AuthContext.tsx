import React, { createContext, useCallback, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { http, setAuthDisabled, abortAuthRefresh } from '../api/http';
import { on } from '../services/eventBus';
import { clearAuthBundle, clearTokens, getAuthBundle, getRefreshToken, saveAuthBundle, saveTokens } from './tokenStorage';
import type { AuthBundle, Tokens, PublicUser } from './tokenStorage';
import type { AuthContextValue } from './types';
import { registerForPushNotificationsAsync } from '../services/notifications';

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
    (async () => {
      // ... (existing load logic) ...
      // After loading, if user exists, sync FCM
      if (bundle?.user && bundle?.tokens) {
        // Sync in background
        syncFcm();
      }
      setState({ user: bundle?.user ?? null, tokens: bundle?.tokens ?? null, loading: false, error: null });
      // ... (existing logs) ...
    })();
  }, []);

  // ... (existing session_expired effect) ...

  const login = useCallback(async (emailOrPhone: string, password: string, deviceId?: string): Promise<{ user: PublicUser | null; tokens: Tokens }> => {
    // ... (existing login logic start) ...
    // ...
    await saveAuthBundle({ user, tokens });
    setState({ user, tokens, loading: false, error: null });
    setAuthDisabled(false);
    // Sync FCM after login
    syncFcm();
    return { user, tokens };
  }
    // ...
      await saveAuthBundle({ user: userClassic, tokens: tokensClassic });
  setState({ user: userClassic || null, tokens: tokensClassic, loading: false, error: null });
  setAuthDisabled(false);
  // Sync FCM after classic login
  syncFcm();
  return { user: userClassic, tokens: tokensClassic as Tokens };
} catch (e) {
  // ...
}
  }, [syncFcm]);

const register = useCallback(async (payload: Record<string, unknown>): Promise<{ user: PublicUser | null; tokens: Tokens }> => {
  // ...
  await saveAuthBundle({ user, tokens });
  setState({ user: user || null, tokens, loading: false, error: null });
  setAuthDisabled(false);
  // Sync FCM after registration
  syncFcm();
  return { user, tokens: tokens as Tokens };
} catch (e) {
  // ...
}
  }, [syncFcm]);

// ... (rest of methods) ...

const value: AuthContextValue = { ...state, login, logout, setUser, refreshTokens, register };

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
