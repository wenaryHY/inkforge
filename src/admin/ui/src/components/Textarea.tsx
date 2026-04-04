import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  minRows?: number;
}

const s = {
  wrap:  { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--if-text-secondary)', letterSpacing: '0.01em' },
  area: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid var(--if-border)',
    borderRadius: 'var(--if-radius-md)',
    fontSize: '14px',
    lineHeight: 1.65,
    color: 'var(--if-text)',
    background: 'var(--if-bg-card)',
    outline: 'none',
    resize: 'vertical' as const,
    transition: 'var(--if-transition)',
    fontFamily: "inherit",
    boxSizing: 'border-box' as const,
  },
  error: { fontSize: '12px', color: 'var(--if-danger)', marginTop: '2px' },
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, minRows, style, ...props }, ref) => {
    return (
      <div style={s.wrap} className={className}>
        {label && <label htmlFor={id} style={s.label}>{label}</label>}
        <textarea
          ref={ref}
          id={id}
          {...props}
          style={{
            ...s.area,
            minHeight: minRows ? `${minRows * 1.75}rem` : undefined,
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

Textarea.displayName = 'Textarea';
