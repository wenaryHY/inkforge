import type { ReactNode } from 'react';
import { IconLayoutDashboard } from './Icons';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center', padding: '56px 16px',
    }}>
      <div style={{
        width: '64px', height: '64px', margin: '0 auto 18px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--md-surface-container)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: 'var(--md-outline)', opacity: 0.6 }}>
          {icon || <IconLayoutDashboard size={28} />}
        </span>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--md-on-surface-variant)', fontWeight: 500 }}>
        {message}
      </p>
      {action && <div style={{ marginTop: '18px' }}>{action}</div>}
    </div>
  );
}
