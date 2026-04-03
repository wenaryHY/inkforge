import type { ReactNode } from 'react';
import { IconLayoutDashboard } from './Icons';

interface EmptyStateProps {
  icon?: ReactNode;
  message: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-[56px] px-[16px] ${className}`}>
      <div className="w-[64px] h-[64px] mx-auto mb-[16px] rounded-2xl bg-gradient-to-br from-bg-secondary to-bg flex items-center justify-center">
        {icon || <IconLayoutDashboard size={28} className="text-text-muted/40" />}
      </div>
      <p className="text-sm text-text-muted font-medium">{message}</p>
      {action && <div className="mt-[16px]">{action}</div>}
    </div>
  );
}
