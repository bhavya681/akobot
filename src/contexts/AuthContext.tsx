"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

/** Proactive token refresh interval: 13 minutes (refresh ~2 min before 15-min session expiry) */
const TOKEN_REFRESH_INTERVAL_MS = 13 * 60 * 1000;
/** Grace period after login - don't run refresh (avoids 401 right after login) */
const POST_LOGIN_GRACE_MS = 90 * 1000;

interface User {
  id: string;
  role?: string;
  username?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const lastAuthTimeRef = useRef<number>(0);

  // Load user from localStorage on mount and keep in sync
  useEffect(() => {
    const loadUser = () => {
      try {
        const hasToken = authAPI.isAuthenticated();
        const userData = authAPI.getCurrentUser();
        if (hasToken && userData) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Listen for storage changes (e.g., from other tabs or after login)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        loadUser();
      }
    };

    // Same-tab auth updates (login, logout)
    const handleCustomStorageChange = () => {
      loadUser();
    };

    // Sync when tab becomes visible (e.g. user logged in/out in another tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-storage-change', handleCustomStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-storage-change', handleCustomStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Proactive token refresh every 5 minutes when authenticated (no immediate refresh after login)
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const hasRefreshToken = typeof window !== "undefined" && !!localStorage.getItem("refreshToken");
    if (!authAPI.isAuthenticated() || !authAPI.getCurrentUser() || !hasRefreshToken) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    const doRefresh = async () => {
      // Skip refresh during grace period after login (avoids 401 → logout right after login)
      if (Date.now() - lastAuthTimeRef.current < POST_LOGIN_GRACE_MS) {
        return;
      }
      try {
        const data = await authAPI.refresh();
        // Update React state with the new tokens/user so the UI stays in sync
        if (data?.accessToken) {
          const updatedUser = authAPI.getCurrentUser();
          if (updatedUser) {
            setUser(updatedUser);
          }
        }
      } catch (err) {
        console.warn('Token refresh skipped/failed; will retry on next cycle:', err);
      }
    };

    // Don't run doRefresh immediately - only on interval. Prevents logout right after login.
    refreshIntervalRef.current = setInterval(doRefresh, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [user]);

  const refreshUser = () => {
    const userData = authAPI.getCurrentUser();
    const hasToken = authAPI.isAuthenticated();
    setUser(hasToken && userData ? userData : null);
  };

  const login = async (identifier: string, password: string) => {
    try {
      const result = await authAPI.login(identifier, password);
      lastAuthTimeRef.current = Date.now();
      const userData = result.user ?? authAPI.getCurrentUser();
      if (result.accessToken) {
        setUser(userData ?? authAPI.getCurrentUser());
        window.dispatchEvent(new Event('auth-storage-change'));
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const result = await authAPI.register(email, username, password);
      lastAuthTimeRef.current = Date.now();
      const userData = result.user ?? authAPI.getCurrentUser();
      if (result.accessToken) {
        setUser(userData ?? authAPI.getCurrentUser());
        window.dispatchEvent(new Event('auth-storage-change'));
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      // Dispatch custom event for immediate UI updates
      window.dispatchEvent(new Event('auth-storage-change'));
      router.push('/');
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      window.dispatchEvent(new Event('auth-storage-change'));
      router.push('/');
      throw error;
    }
  };

  // Single source of truth: both user state and token must be present
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
  const isAuthenticated = !!user && hasToken;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

