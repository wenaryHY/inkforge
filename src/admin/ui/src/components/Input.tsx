import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-3.5 py-2.5 border border-border rounded-lg text-sm
            outline-none bg-white text-text-main
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

Input.displayName = 'Input';
