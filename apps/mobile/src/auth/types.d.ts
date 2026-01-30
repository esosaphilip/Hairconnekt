import type { PublicUser, Tokens } from './tokenStorage';

export interface AuthContextValue {
  user: PublicUser | null;
  tokens: Tokens | null;
  loading: boolean;
  error: string | null;
  login: (emailOrPhone: string, password: string) => Promise<{ user: PublicUser | null; tokens: Tokens }>;
  register: (payload: Record<string, unknown>) => Promise<{ user: PublicUser | null; tokens: Tokens }>;
  setSession: (user: PublicUser, tokens: Tokens) => Promise<void>;
  refreshTokens: () => Promise<Tokens | null>;
  logout: () => Promise<void>;
  setUser: (u: PublicUser | null) => Promise<void>;
}