import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const s = {
  card: {
    background: 'var(--if-bg-card)',
    border: '1px solid var(--if-border-light)',
    borderRadius: 'var(--if-radius-lg)',
    boxShadow: 'var(--if-shadow-sm)',
    overflow: 'hidden' as const,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid var(--if-border-light)',
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
