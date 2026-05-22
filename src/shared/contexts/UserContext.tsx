'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

import { API, ApiError } from '@/api';
import { AUTH_COOKIES, deleteCookie, hasCookie } from '@/shared/lib/cookies';

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

type UserProviderProps = {
  children: ReactNode;
  initialUser?: User | null;
};

export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(initialUser === null && hasCookie(AUTH_COOKIES.SESSION_FLAG));
  const [error, setError] = useState<ApiError | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await API.get<User>('/profile');
      setUser(data);

    } catch (e) {
      setUser(null);

      if (e instanceof ApiError) {
        setError(e);
      }

    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post('/auth/logout');
    } finally {
      deleteCookie(AUTH_COOKIES.ACCESS);
      deleteCookie(AUTH_COOKIES.REFRESH);
      deleteCookie(AUTH_COOKIES.SESSION_FLAG);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (initialUser === null && hasCookie(AUTH_COOKIES.SESSION_FLAG)) {
      void fetchUser();
    }
  }, [fetchUser, initialUser]);

  const value = useMemo<UserContextValue>(
    () => ({ user, loading, error, refetch: fetchUser, setUser, logout }),
    [user, loading, error, fetchUser, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);

  if (ctx === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return ctx;
}
