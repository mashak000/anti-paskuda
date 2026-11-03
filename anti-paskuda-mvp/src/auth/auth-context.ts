import type { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
