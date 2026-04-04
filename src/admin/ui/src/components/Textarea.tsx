import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  minRows?: number;
}

const s = {
  wrap:  { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em' },
  area: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    lineHeight: 1.65,
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
    outline: 'none',
    resize: 'vertical' as const,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  error: { fontSize: '12px', color: 'var(--danger-600)', marginTop: '2px' },
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
        />
        {error && <span style={s.error}>{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
