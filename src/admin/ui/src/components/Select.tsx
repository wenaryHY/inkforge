import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const s = {
  wrap:    { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label:   { fontSize: '13px', fontWeight: 600, color: 'var(--if-text-secondary)', letterSpacing: '0.01em' },
  select:  {
    width: '100%',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    height: '42px',
    padding: '0 36px 0 14px',
    border: '1.5px solid var(--if-border)',
    borderRadius: 'var(--if-radius-md)',
    fontSize: '14px',
    color: 'var(--if-text)',
    background: `var(--if-bg-card) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`,
    backgroundSize: '16px 16px',
    outline: 'none',
    cursor: 'pointer',
    transition: 'var(--if-transition)',
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
            ...(error ? { borderColor: 'var(--if-danger)' } : {}),
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--if-border-focus)';
            e.currentTarget.style.boxShadow = '0 0 0 4px var(--if-primary-glow)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--if-danger)' : 'var(--if-border)';
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
