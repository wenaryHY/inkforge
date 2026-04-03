import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Spinner } from './Icons';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<string, { base: string; hover: string; shadow: string }> = {
  primary: { base: 'bg-primary text-white', hover: 'hover:bg-primary-dark', shadow: 'shadow-[0_2px_8px_rgba(99,102,241,0.25)]' },
  danger:  { base: 'bg-danger text-white', hover: 'hover:bg-red-600', shadow: '' },
  success: { base: 'bg-success text-white', hover: 'hover:bg-emerald-600', shadow: '' },
  ghost:   { base: 'bg-white text-text-secondary border border-border', hover: 'hover:bg-bg-secondary hover:border-text-muted/50 hover:text-text-main', shadow: '' },
  warning: { base: 'bg-warning text-white', hover: 'hover:bg-amber-600', shadow: '' },
};

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-base gap-2 rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const v = variantClasses[variant] || variantClasses.primary;
  const isDisabled = disabled || loading;

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold cursor-pointer
        transition-all duration-150
        active:scale-[0.97]
        ${v.base} ${v.hover} ${v.shadow}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Spinner size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
