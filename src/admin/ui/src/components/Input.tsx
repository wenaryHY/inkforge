import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/* ── 设计指南：输入框状态 — 默认/聚焦/错误/禁用 ── */
const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.01em',
  },
  input: {
    width: '100%',
    height: '40px',
    padding: '0 14px',
    border: '1.5px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
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
            /* 错误状态：红色边框 */
            ...(error ? { borderColor: 'var(--danger-500)' } : {}),
            /* 禁用状态：灰色文字暗示不可用 */
            ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          }}
          onFocus={(e) => {
            if (disabled) return;
            /* 聚焦状态：主色边框 + 光晕 */
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

Input.displayName = 'Input';
