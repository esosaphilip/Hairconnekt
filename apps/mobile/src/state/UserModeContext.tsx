import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Mode = 'client' | 'provider';
type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
};

const UserModeContext = createContext<Ctx | undefined>(undefined);

export function UserModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('client');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('hc_user_mode');
        if (saved === 'client' || saved === 'provider') {
          if (mounted) setModeState(saved);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);
  const setMode = (m: Mode) => {
    setModeState(m);
    try { AsyncStorage.setItem('hc_user_mode', m); } catch {}
  };
  const toggleMode = () => setMode(mode === 'client' ? 'provider' : 'client');
  return (
    <UserModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const ctx = useContext(UserModeContext);
  if (!ctx) throw new Error('useUserMode must be used within UserModeProvider');
  return ctx;
}

