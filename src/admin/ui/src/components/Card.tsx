import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/* ── 设计指南：卡片阴影应弱化，不应成为视觉焦点 ── */
const s = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--elevation-1)',
    overflow: 'hidden' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid var(--border-light)',
  },
  body: {},
};

export function Card({ children, header, className, style }: CardProps) {
  return (
    <div style={{ ...s.card, ...style }} className={className}>
      {header && <div style={s.header}>{header}</div>}
      <div>{children}</div>
    </div>
  );
}
