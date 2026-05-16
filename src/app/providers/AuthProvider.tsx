import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

import { getFirebaseAuth, isFirebaseConfigured } from '@/firebase';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isConfigured: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const isConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
      setIsInitialized(true);
    });

    return unsubscribe;
  }, [isConfigured]);

  const value = useMemo(
    () => ({ user, isLoading, isInitialized, isConfigured }),
    [user, isLoading, isInitialized, isConfigured],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
