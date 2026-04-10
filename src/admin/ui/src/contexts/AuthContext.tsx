import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiData, API_PREFIX } from '../lib/api';
import type { CurrentUser } from '../types';
import { useI18n } from '../i18n';
import { saveLanguage } from '../i18n/detector';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

interface AuthContextValue {
  user: CurrentUser | null;
  token: string;
  login: (login: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const SESSION_TOKEN = 'session';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setTokenState] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { setLang } = useI18n();

  const clearAuth = useCallback(() => {
    setTokenState('');
    setUser(null);
  }, []);

  const applySession = useCallback(() => {
    setTokenState(SESSION_TOKEN);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await apiData<CurrentUser>(`${API_PREFIX}/me`);
    setUser(me);
    applySession();
    if (me.language) {
      setLang(me.language);
      saveLanguage(me.language);
    }
  }, [applySession, setLang]);

  useEffect(() => {
    let active = true;
    refreshUser()
      .catch(() => {
        if (active) clearAuth();
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshUser, clearAuth]);

  const login = useCallback(async (loginValue: string, password: string) => {
    try {
      await apiData<{ token: string }>(`${API_PREFIX}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ login: loginValue, password }),
      });
      await refreshUser();
      return { success: true };
    } catch (error) {
      clearAuth();
      return { success: false, message: error instanceof Error ? error.message : '登录失败' };
    }
  }, [clearAuth, refreshUser]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      await apiData<{ token: string }>(`${API_PREFIX}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      await refreshUser();
      return { success: true };
    } catch (error) {
      clearAuth();
      return { success: false, message: error instanceof Error ? error.message : '注册失败' };
    }
  }, [clearAuth, refreshUser]);

  const logout = useCallback(async () => {
    try {
      await apiData(`${API_PREFIX}/auth/logout`, { method: 'POST' });
    } catch {
      // ignore server-side logout failure and always clear local auth state
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    isLoading,
  }), [user, token, login, register, logout, refreshUser, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
