import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiData, getToken, removeToken, setToken } from '../lib/api';
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

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setTokenState] = useState(() => getToken());
  const [isLoading, setIsLoading] = useState(true);
  const { setLang } = useI18n();

  const clearAuth = useCallback(() => {
    removeToken();
    setTokenState('');
    setUser(null);
  }, []);

  const applyToken = useCallback((nextToken: string) => {
    setToken(nextToken);
    setTokenState(nextToken);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    const me = await apiData<CurrentUser>('/api/me');
    setUser(me);
    // 同步用户语言偏好
    if (me.language) {
      setLang(me.language);
      saveLanguage(me.language);
    }
  }, [setLang]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    refreshUser()
      .catch(() => clearAuth())
      .finally(() => setIsLoading(false));
  }, [token, refreshUser, clearAuth]);

  const login = useCallback(async (loginValue: string, password: string) => {
    try {
      const payload = await apiData<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login: loginValue, password }),
      });
      applyToken(payload.token);
      // 不在这里调用 refreshUser，让 useEffect 处理
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      clearAuth();
      return { success: false, message };
    }
  }, [applyToken, clearAuth]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const payload = await apiData<{ token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      applyToken(payload.token);
      // 不在这里调用 refreshUser，让 useEffect 处理
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败';
      return { success: false, message };
    }
  }, [applyToken]);

  const logout = useCallback(async () => {
    try {
      if (getToken()) {
        await apiData('/api/auth/logout', { method: 'POST' });
      }
    } catch {
      // ignore server-side logout failure and always clear local auth
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
