import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em' },
  select: {
    width: '100%',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    height: '40px',
    padding: '0 36px 0 14px',
    border: '1.5px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: `var(--bg-card) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`,
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
            ...(error ? { borderColor: 'var(--danger-500)' } : {}),
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-100)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger-500)' : 'var(--border-default)';
            e.currentTarget.style.boxShadow = 'none';
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
