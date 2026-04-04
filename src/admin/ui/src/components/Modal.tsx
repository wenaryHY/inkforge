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
        /* 遮罩/覆盖层：渐变 + 模糊 */
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <div
        className="if-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          /* 弹出框/模态框：较强阴影（区别于卡片的弱阴影） */
          boxShadow: 'var(--elevation-3), 0 0 0 1px rgba(0,0,0,0.03)',
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
          borderBottom: '1px solid var(--border-light)',
          flexShrink: 0,
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
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
            display: 'flex', justifyContent: 'flex-end', gap: '8px',
            padding: '16px 24px',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--bg-subtle)',
            flexShrink: 0,
            borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
          }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
