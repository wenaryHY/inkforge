import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { IconCheckCircle, IconXCircle, IconAlertCircle } from '../components/Icons';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const ToastContext = createContext<{
  toast: (message: string, type?: Toast['type']) => void;
} | null>(null);

let nextId = 0;

/* 设计指南：语义色彩 — 绿=成功，红=错误，蓝=信息 */
const toastStyles: Record<Toast['type'], { borderColor: string; textColor: string; iconBg: string }> = {
  success: {
    borderColor: 'var(--success-500)',
    textColor: 'var(--success-600)',
    iconBg: 'var(--success-50)',
  },
  error: {
    borderColor: 'var(--danger-500)',
    textColor: 'var(--danger-600)',
    iconBg: 'var(--danger-50)',
  },
  info: {
    borderColor: 'var(--info-500)',
    textColor: 'var(--info-600)',
    iconBg: 'var(--info-50)',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* 设计指南：Toast — 微交互反馈，从右侧滑入 */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        {toasts.map((t) => {
          const s = toastStyles[t.type];
          return (
            <div
              key={t.id}
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 500,
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--elevation-2)',
                minWidth: '240px',
                maxWidth: '420px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                pointerEvents: 'auto',
                borderLeft: '3px solid ' + s.borderColor,
                animation: 'toastIn 0.3s ease',
              }}
            >
              {/* 语义色图标背景 */}
              <span style={{
                color: s.textColor,
                background: s.iconBg,
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {t.type === 'success' && <IconCheckCircle size={16} />}
                {t.type === 'error' && <IconXCircle size={16} />}
                {t.type === 'info' && <IconAlertCircle size={16} />}
              </span>
              <span style={{ flex: 1, lineHeight: 1.5 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
