import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

/* ── MD3 Select：无边框，背景色层级区分，focus ring ── */
const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--md-on-surface-variant)', letterSpacing: '0.01em' },
  select: {
    width: '100%',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    height: '40px',
    padding: '0 36px 0 14px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    color: 'var(--md-on-surface)',
    background: `var(--md-surface-container-low) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777b84' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`,
    backgroundSize: '16px 16px',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box' as const,
  },
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, style, ...props }, ref) => {
    return (
      <div style={s.wrap} className={className}>
        {label && <label htmlFor={id} style={s.label}>{label}</label>}
        <select
          ref={ref}
          id={id}
          {...props}
          style={{
            ...s.select,
            ...style,
            ...(error ? { background: `rgba(239,68,68,0.08) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777b84' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`, color: 'var(--danger-600)' } : {}),
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.2)';
            e.currentTarget.style.background = `var(--md-surface-container-lowest) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777b84' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`;
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = error
              ? `rgba(239,68,68,0.08) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777b84' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`
              : `var(--md-surface-container-low) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777b84' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`;
            props.onBlur?.(e);
          }}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
