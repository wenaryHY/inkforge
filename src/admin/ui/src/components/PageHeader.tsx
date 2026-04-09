import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '24px',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'Manrope',
          fontSize: '24px', fontWeight: 800, color: 'var(--md-on-surface)',
          letterSpacing: '-0.3px', lineHeight: 1.2,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--md-outline)', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
