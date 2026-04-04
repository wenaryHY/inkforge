import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Spinner } from './Icons';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

/* ── 设计指南：实心按钮（有背景色）vs Ghost 按钮（默认无背景，hover才显示） ── */
const VARIANTS = {
  primary: {
    bg:       'var(--primary-500)',
    color:    '#ffffff',
    shadow:   '0 1px 3px rgba(255,107,53,0.25)',
    hoverBg:  'var(--primary-600)',
    hoverSh:  '0 4px 12px rgba(255,107,53,0.30)',
  },
  danger: {
    bg:       'var(--danger-500)', color: '#ffffff',
    shadow:   '0 1px 3px rgba(239,68,68,0.20)',
    hoverBg:  'var(--danger-600)', hoverSh: '0 4px 12px rgba(239,68,68,0.25)',
  },
  success: {
    bg:       'var(--success-500)', color: '#ffffff',
    shadow:   '0 1px 3px rgba(16,185,129,0.20)',
    hoverBg:  'var(--success-600)', hoverSh: '0 4px 12px rgba(16,185,129,0.25)',
  },
  warning: {
    bg:       'var(--warning-500)', color: '#ffffff',
    shadow:   '0 1px 3px rgba(245,158,11,0.20)',
    hoverBg:  'var(--warning-600)', hoverSh: '0 4px 12px rgba(245,158,11,0.25)',
  },
  /* Ghost: 可供性指示 — 默认无背景，hover 显示浅灰背景 */
  ghost: {
    bg:       'transparent',
    color:    'var(--text-secondary)',
    border:   '1.5px solid var(--border-default)',
    shadow:   'none',
    hoverBg:  'var(--bg-subtle)',
    hoverSh:  'none',
    hoverBorder: 'var(--text-muted)',
    hoverColor:  'var(--text-primary)',
  },
};

/* ── 设计指南：按钮宽度应为高度的两倍 ── */
const SIZES = {
  sm: { height: '32px', padding: '0 14px', fontSize: '12px', radius: 'var(--radius-sm)' },
  md: { height: '40px', padding: '0 24px', fontSize: '14px', radius: 'var(--radius-md)' },
  lg: { height: '48px', padding: '0 32px', fontSize: '15px', radius: 'var(--radius-md)' },
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
    border: variant === 'ghost' ? (v as typeof VARIANTS.ghost).border : 'none',
    borderRadius: sz.radius,
    fontSize: sz.fontSize,
    fontWeight: 600,
    color: v.color,
    background: v.bg,
    boxShadow: v.shadow,
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
          if (variant === 'ghost') {
            e.currentTarget.style.background = (v as typeof VARIANTS.ghost).hoverBg;
            e.currentTarget.style.borderColor = (v as typeof VARIANTS.ghost).hoverBorder!;
            e.currentTarget.style.color = (v as typeof VARIANTS.ghost).hoverColor!;
          } else {
            e.currentTarget.style.background = v.hoverBg;
            e.currentTarget.style.boxShadow = v.hoverSh;
          }
          /* 微交互：hover 上浮 2px */
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = v.bg;
          e.currentTarget.style.boxShadow = v.shadow;
          e.currentTarget.style.transform = 'translateY(0)';
          if (variant === 'ghost') {
            e.currentTarget.style.color = v.color;
            e.currentTarget.style.borderColor = (v as typeof VARIANTS.ghost).border!;
          }
        }
        onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          /* 微交互：active 按压反馈 */
          e.currentTarget.style.transform = 'scale(0.97)';
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      {...props}
    >
      {loading && <Spinner size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
