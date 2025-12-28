import React from 'react';
import { AuthProvider } from '@/auth/AuthContext';
import { UserModeProvider } from '@/state/UserModeContext';
import { LocationProvider } from '@/context/LocationContext';
import { I18nProvider } from '@/i18n';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import ModeSwitcher from '@/components/ModeSwitcher';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <UserModeProvider>
        <LocationProvider>
          <I18nProvider>
            <ErrorBoundary>
              <ModeSwitcher />
              <RootNavigator />
            </ErrorBoundary>
          </I18nProvider>
        </LocationProvider>
      </UserModeProvider>
    </AuthProvider>
  );
}
