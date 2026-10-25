'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

import { API, ApiError } from '@/api';
import { getProfile } from '@/api/profile';
import { AUTH_COOKIES, deleteCookie, hasCookie } from '@/shared/lib/cookies';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  emailVerified: boolean;
  approvedByAdmin: boolean;
  createdAt: string;
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

  // State updates run only in promise callbacks (after the request settles), so the mount
  // effect can call this without a synchronous setState (react-hooks/set-state-in-effect).
  const loadProfile = useCallback(
    (): Promise<void> =>
      getProfile()
        .then((data: User) => {
          setUser(data);
        })
        .catch((e: unknown) => {
          setUser(null);

          if (e instanceof ApiError) {
            setError(e);
          }
        })
        .finally(() => {
          setLoading(false);
        }),
    [],
  );

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    await loadProfile();
  }, [loadProfile]);

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

  // Initial state already has loading = true and error = null when this fetch is needed.
  useEffect(() => {
    if (initialUser === null && hasCookie(AUTH_COOKIES.SESSION_FLAG)) {
      void loadProfile();
    }
  }, [loadProfile, initialUser]);

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
