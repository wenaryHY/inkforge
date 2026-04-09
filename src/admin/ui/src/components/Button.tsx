import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Spinner } from './Icons';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

/* ── MD3 按钮：pill 圆角，纯色填充，无阴影，scale 按压反馈 ── */
const VARIANTS = {
  primary: {
    bg:       'var(--md-primary)',
    color:    'var(--md-on-primary)',
    hoverBg:  'var(--md-primary-dim)',
  },
  danger: {
    bg:       'var(--danger-500)',
    color:    '#ffffff',
    hoverBg:  'var(--danger-600)',
  },
  success: {
    bg:       'var(--success-500)',
    color:    '#ffffff',
    hoverBg:  'var(--success-600)',
  },
  warning: {
    bg:       'var(--warning-500)',
    color:    '#ffffff',
    hoverBg:  'var(--warning-600)',
  },
  /* Ghost → Tonal: MD3 Tonal Button 风格 */
  ghost: {
    bg:       'var(--md-primary-container)',
    color:    'var(--md-on-primary-container)',
    hoverBg:  'var(--md-surface-container-highest)',
  },
};

/* ── MD3：所有尺寸统一 pill 圆角 ── */
const SIZES = {
  sm: { height: '32px', padding: '0 16px', fontSize: '12px' },
  md: { height: '40px', padding: '0 24px', fontSize: '14px' },
  lg: { height: '48px', padding: '0 32px', fontSize: '15px' },
};

export function Button({
  variant = 'primary', size = 'md', loading = false,
  children, disabled, style,
  className,
  onMouseEnter, onMouseLeave,
  ...props
}: ButtonProps) {
  const v = VARIANTS[variant];
  const sz = SIZES[size];
  const isDisabled = disabled || loading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: sz.height,
    padding: sz.padding,
    border: 'none',
    borderRadius: 'var(--radius-full)',
    fontSize: sz.fontSize,
    fontWeight: 600,
    color: v.color,
    background: v.bg,
    boxShadow: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.45 : 1,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'inherit',
    letterSpacing: '0.01em',
    ...style,
  };

  return (
    <button
      className={className}
      disabled={isDisabled}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = v.hoverBg;
          e.currentTarget.style.transform = 'scale(0.97)';
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = v.bg;
          e.currentTarget.style.transform = 'scale(1)';
        }
        onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'scale(0.95)';
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'scale(0.97)';
        }
      }}
      {...props}
    >
      {loading && <Spinner size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
