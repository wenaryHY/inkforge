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
        borderRadius: '16px',
        background: 'var(--if-bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: 'var(--if-text-muted)', opacity: 0.5 }}>
          {icon || <IconLayoutDashboard size={28} />}
        </span>
      </div>
      <p style={{ fontSize: '14px', color: 'var(--if-text-muted)', fontWeight: 500 }}>
        {message}
      </p>
      {action && <div style={{ marginTop: '18px' }}>{action}</div>}
    </div>
  );
}
