import { useEffect, type ReactNode } from 'react';
import { IconX } from './Icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, actions, width = '560px' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl overflow-y-auto max-h-[85vh] shadow-2xl animate-in zoom-in-95 duration-150"
        style={{ width, maxWidth: width === '90%' ? '960px' : undefined }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h3 className="text-base font-semibold text-text-main">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-none bg-transparent text-text-muted cursor-pointer rounded-lg hover:bg-bg-secondary hover:text-text-main transition-colors duration-150"
          >
            <IconX />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {actions && (
          <div className="flex gap-2 justify-end px-6 py-4 border-t border-border-light bg-bg-secondary/50 rounded-b-2xl">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
