import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/* ── MD3 Input：无边框，背景色层级区分，focus ring ── */
const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--md-on-surface-variant)',
    letterSpacing: '0.01em',
  },
  input: {
    width: '100%',
    height: '40px',
    padding: '0 14px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    color: 'var(--md-on-surface)',
    background: 'var(--md-surface-container-low)',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box' as const,
  },
  error: {
    fontSize: '12px',
    color: 'var(--danger-600)',
    marginTop: '2px',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, style, disabled, ...props }, ref) => {
    return (
      <div style={s.wrap} className={className}>
        {label && <label htmlFor={id} style={s.label}>{label}</label>}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          {...props}
          style={{
            ...s.input,
            ...style,
            /* 错误状态：红色系背景 */
            ...(error ? { background: 'rgba(239,68,68,0.08)', color: 'var(--danger-600)' } : {}),
            /* 禁用状态 */
            ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          }}
          onFocus={(e) => {
            if (disabled) return;
            /* 聚焦：ring + 背景变亮 */
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

Input.displayName = 'Input';
