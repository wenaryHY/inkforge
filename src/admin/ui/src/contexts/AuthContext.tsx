import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api, getToken, setToken, removeToken } from '../lib/api';
import type { CurrentUser } from '../types';

interface AuthContextValue {
  user: CurrentUser | null;
  token: string;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setTokenState] = useState(() => getToken());
  const [isLoading, setIsLoading] = useState(true);

  const updateToken = useCallback((newToken: string | null) => {
    if (newToken) {
      setToken(newToken);
      setTokenState(newToken);
    } else {
      removeToken();
      setTokenState('');
    }
  }, []);

  useEffect(() => {
    // 启动时验证 token 是否有效（后端 /api/me 只支持 POST）
    if (token) {
      api('/api/me', { method: 'POST' }).then((r) => {
        if (r.code === 0 && r.data) {
          setUser(r.data as unknown as CurrentUser);
        } else {
          updateToken(null);
        }
      }).catch(() => updateToken(null)).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, updateToken]);

  const login = useCallback(async (username: string, password: string) => {
    const r = await api<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (r.code === 0 && r.data) {
      // r.data 是 { token: "xxx" }，需要提取 token 字段
      const tokenStr = (r.data as unknown as { token: string }).token;
      updateToken(tokenStr);
      return { success: true };
    }
    return { success: false, message: r.message || '登录失败' };
  }, [updateToken]);

  const register = useCallback(async (data: RegisterData) => {
    const r = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (r.code === 0) return { success: true };
    return { success: false, message: r.message || '注册失败' };
  }, []);

  const logout = useCallback(() => {
    updateToken(null);
    setUser(null);
  }, [updateToken]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
