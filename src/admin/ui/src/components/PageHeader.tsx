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
        {/* 设计指南：后台界面标题字号不超过 24px */}
        <h1 style={{
          fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)',
          letterSpacing: '-0.3px', lineHeight: 1.2,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
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
