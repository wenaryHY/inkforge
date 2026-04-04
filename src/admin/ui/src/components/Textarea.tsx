import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  minRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, minRows, style, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          style={{ minHeight: minRows ? `${minRows * 1.75}rem` : undefined, ...style }}
          className={`w-full px-3.5 py-2.5 border border-border rounded-lg text-sm
            outline-none bg-white text-text-main resize-y
            transition-all duration-150
            focus:border-primary focus:ring-2 focus:ring-primary/20
            placeholder:text-text-muted/50
            disabled:bg-bg-secondary disabled:cursor-not-allowed
            ${error ? 'border-danger focus:ring-danger/20' : ''}
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger mt-0.5">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
