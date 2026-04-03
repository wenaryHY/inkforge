import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
}

export function Card({ children, header, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-border shadow-sm ${className}`}>
      {header && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          {header}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
