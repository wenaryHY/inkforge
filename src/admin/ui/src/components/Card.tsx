import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/* ── MD3 Tonal Layering：卡片靠背景色层级区分，无阴影无边框 ── */
const s = {
  card: {
    background: 'var(--md-surface-container-low)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'none',
    overflow: 'hidden' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
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
