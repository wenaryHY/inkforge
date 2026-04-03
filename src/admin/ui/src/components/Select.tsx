import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', id, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full px-3.5 py-2.5 border border-border rounded-lg text-sm
            outline-none bg-white text-text-main
            transition-all duration-150 appearance-none
            focus:border-primary focus:ring-2 focus:ring-primary/20
            disabled:bg-bg-secondary disabled:cursor-not-allowed
            ${error ? 'border-danger focus:ring-danger/20' : ''}
            ${className}`}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em', paddingRight: '2.5rem' }}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-danger mt-0.5">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
