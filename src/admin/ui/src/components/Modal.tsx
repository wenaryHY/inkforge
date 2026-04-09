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
          background: 'var(--md-surface-container-lowest)',
          borderRadius: 'var(--radius-xl)',
          /* MD3：Modal 保留极轻阴影（唯一使用 elevation 的场景） */
          boxShadow: 'var(--elevation-1)',
          width: width === '90%' ? '92%' : width,
          maxWidth: width === '90%' ? '900px' : undefined,
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header — 无底部边框，靠间距分隔 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          flexShrink: 0,
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--md-on-surface)', letterSpacing: '-0.2px' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-full)', border: 'none', background: 'transparent',
              color: 'var(--md-outline)', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--md-surface-container)';
              e.currentTarget.style.color = 'var(--md-on-surface)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--md-outline)';
            }}
          >
            <IconX />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
        {/* Footer — 无顶部边框，靠背景色差异分隔 */}
        {actions && (
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '8px',
            padding: '16px 24px',
            background: 'var(--md-surface-container-low)',
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
