import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const s = {
  wrap:    { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label:   { fontSize: '13px', fontWeight: 600, color: 'var(--if-text-secondary)', letterSpacing: '0.01em' },
  input: {
    width: '100%', height: '42px',
    padding: '0 14px',
    border: '1.5px solid var(--if-border)',
    borderRadius: 'var(--if-radius-md)',
    fontSize: '14px',
    color: 'var(--if-text)',
    background: 'var(--if-bg-card)',
    outline: 'none',
    transition: 'var(--if-transition)',
    boxSizing: 'border-box' as const,
  },
  error:   { fontSize: '12px', color: 'var(--if-danger)', marginTop: '2px' },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, style, ...props }, ref) => {
    return (
      <div style={s.wrap} className={className}>
        {label && <label htmlFor={id} style={s.label}>{label}</label>}
        <input
          ref={ref}
          id={id}
          {...props}
          style={{
            ...s.input,
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
        />
        {error && <span style={s.error}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
