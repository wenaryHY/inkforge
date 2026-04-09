import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  minRows?: number;
}

/* ── MD3 Textarea：无边框，背景色层级区分，focus ring ── */
const s = {
  wrap:  { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: 'var(--md-on-surface-variant)', letterSpacing: '0.01em' },
  area: {
    width: '100%',
    padding: '12px 14px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    lineHeight: 1.65,
    color: 'var(--md-on-surface)',
    background: 'var(--md-surface-container-low)',
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
            ...(error ? { background: 'rgba(239,68,68,0.08)', color: 'var(--danger-600)' } : {}),
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(249,115,22,0.2)';
            e.currentTarget.style.background = 'var(--md-surface-container-lowest)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = error ? 'rgba(239,68,68,0.08)' : 'var(--md-surface-container-low)';
            props.onBlur?.(e);
          }}
        />
        {error && <span style={s.error}>{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
