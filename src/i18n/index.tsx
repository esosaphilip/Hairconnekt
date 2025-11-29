import React, { createContext, useContext, useEffect, useMemo, useState, PropsWithChildren } from 'react';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import de from './locales/de.json';
import { getPreferredLanguageSetting, savePreferredLanguageSetting } from '@/auth/tokenStorage';
import { useAuth } from '@/auth/AuthContext';

// Configure translations with I18n instance
const i18n = new I18n({ en, de });
i18n.defaultLocale = 'de';
i18n.locale = 'de';
i18n.enableFallback = true;

// Strongly-typed context value
type I18nContextValue = {
  locale: string;
  setLocale: (next: string) => Promise<void> | void;
  t: (key: string, options?: Record<string, any>) => string;
};

// Provide a non-null default to avoid TypeScript inferring the context as `null`
// This prevents "never" types in consumers when destructuring values.
const I18nContext = createContext<I18nContextValue>({
  locale: 'de',
  // No-op default; real implementation is provided by I18nProvider
  setLocale: async (_next: string) => {},
  t: (key: string, options?: Record<string, any>) => i18n.t(key, options),
});

export function I18nProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [locale, setLocaleState] = useState('de');

  // Initialize locale from persisted setting, backend preference, or device settings
  useEffect(() => {
    let mounted = true;
    (async () => {
      const persisted = await getPreferredLanguageSetting();
      const userPref = typeof user?.preferredLanguage === 'string' ? user.preferredLanguage : undefined;
      // Force German as the initial app language unless a preference exists
      const initial = persisted || userPref || 'de';
      if (mounted) {
        i18n.locale = initial;
        setLocaleState(initial);
      }
    })();
    return () => { mounted = false; };
  }, [user?.preferredLanguage]);

  const setLocale = async (next: string) => {
    i18n.locale = next;
    setLocaleState(next);
    try {
      await savePreferredLanguageSetting(next);
    } catch {}
  };

  const value: I18nContextValue = useMemo(() => ({
    locale,
    setLocale,
    t: (key: string, options?: Record<string, any>) => i18n.t(key, options),
  }), [locale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// Convenience export to use t without the hook (for simple modules)
export const t = (key: string, options?: Record<string, any>) => i18n.t(key, options);