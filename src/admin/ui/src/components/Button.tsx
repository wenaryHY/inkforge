import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Spinner } from './Icons';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

const VARIANTS = {
  primary: {
    bg:       'linear-gradient(135deg, #ff6b35 0%, #e55a28 100%)',
    color:    '#ffffff',
    shadow:   '0 4px 14px rgba(255,107,53,0.30)',
    hoverBg:  'linear-gradient(135deg, #e55a28 0%, #cc4d22 100%)',
    hoverSh:  '0 6px 20px rgba(255,107,53,0.40)',
  },
  danger: {
    bg:       '#ef4444', color: '#ffffff',
    shadow:   '0 3px 10px rgba(239,68,68,0.25)',
    hoverBg:  '#dc2626', hoverSh: '0 4px 14px rgba(239,68,68,0.35)',
  },
  success: {
    bg:       '#10b981', color: '#ffffff',
    shadow:   '0 3px 10px rgba(16,185,129,0.25)',
    hoverBg:  '#059669', hoverSh: '0 4px 14px rgba(16,185,129,0.35)',
  },
  warning: {
    bg:       '#f59e0b', color: '#ffffff',
    shadow:   '0 3px 10px rgba(245,158,11,0.25)',
    hoverBg:  '#d97706', hoverSh: '0 4px 14px rgba(245,158,11,0.35)',
  },
  ghost: {
    bg:       '#ffffff', color: 'var(--if-text-secondary)',
    border:   '1.5px solid var(--if-border)',
    shadow:   'none',
    hoverBg:  'var(--if-bg-secondary)', hoverSh: 'none',
    hoverBorder: 'var(--if-text-muted)',
    hoverColor:  'var(--if-text)',
  },
};

const SIZES = {
  sm: { height: '32px', padding: '0 12px', fontSize: '12px', radius: '8px' },
  md: { height: '40px', padding: '0 20px', fontSize: '14px', radius: '10px' },
  lg: { height: '48px', padding: '0 24px', fontSize: '15px', radius: '12px' },
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
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
    height: sz.height, padding: sz.padding,
    border: variant === 'ghost' ? (v as typeof VARIANTS.ghost).border : 'none',
    borderRadius: sz.radius,
    fontSize: sz.fontSize,
    fontWeight: 600,
    color: v.color,
    background: v.bg,
    boxShadow: v.shadow,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.55 : 1,
    transform: isDisabled ? undefined : undefined,
    transition: 'var(--if-transition)',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
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
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
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
      onMouseDown={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      {...props}
    >
      {loading && <Spinner size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
