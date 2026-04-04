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
      className="if-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.40)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="if-scale-in"
        style={{
          background: 'var(--if-bg-card)',
          borderRadius: '18px',
          boxShadow: 'var(--if-shadow-lg), 0 0 0 1px rgba(0,0,0,0.03)',
          width: width === '90%' ? '92%' : width,
          maxWidth: width === '90%' ? '900px' : undefined,
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--if-border-light)',
          flexShrink: 0,
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--if-text)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', border: 'none', background: 'transparent',
              color: 'var(--if-text-muted)', cursor: 'pointer',
              transition: 'var(--if-transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--if-bg-secondary)'; e.currentTarget.style.color = 'var(--if-text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--if-text-muted)'; }}
          >
            <IconX />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
        {/* Footer */}
        {actions && (
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '10px',
            padding: '16px 24px',
            borderTop: '1px solid var(--if-border-light)',
            background: 'var(--if-bg-secondary)',
            flexShrink: 0,
            borderRadius: '0 0 18px 18px',
          }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
