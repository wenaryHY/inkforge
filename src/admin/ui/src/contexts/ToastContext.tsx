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

const toastIcons = {
  success: <IconCheckCircle size={16} />,
  error: <IconXCircle size={16} />,
  info: <IconAlertCircle size={16} />,
};

const toastColors = {
  success: { bg: 'border-l-success', color: 'text-success', iconBg: 'bg-success-bg/20' },
  error:   { bg: 'border-l-danger',  color: 'text-danger',  iconBg: 'bg-danger-bg/20' },
  info:     { bg: 'border-l-info',    color: 'text-info',    iconBg: 'bg-info-bg/20' },
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
      {/* Toast 容器 */}
      <div className="fixed bottom-[24px] right-[24px] z-[9999] flex flex-col gap-[8px] pointer-events-none">
        {toasts.map((t) => {
          const colors = toastColors[t.type];
          return (
            <div
              key={t.id}
              className={`toast-enter bg-white text-sm font-medium px-[16px] py-[12px] rounded-xl shadow-xl shadow-black/8
                min-w-[240px] max-w-[420px] flex items-center gap-[10px] pointer-events-auto
                border-l-[3px] ${colors.bg} animate-[toastIn_0.3s_ease]`}
            >
              <span className={`${colors.color} ${colors.iconBg} w-[24px] h-[24px] rounded-lg flex items-center justify-center flex-shrink-0`}>
                {toastIcons[t.type]}
              </span>
              <span className="text-text-main flex-1 leading-relaxed">{t.message}</span>
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
