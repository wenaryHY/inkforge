import type { ReactNode } from 'react';
import { IconAlertCircle } from './Icons';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'danger',
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: { bg: 'bg-danger-bg', icon: 'text-danger' },
    warning: { bg: 'bg-warning-bg', icon: 'text-warning' },
    info: { bg: 'bg-info-bg', icon: 'text-info' },
  };

  const buttonVariant = variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary';
  const style = variantStyles[variant];

  return (
    <Modal open={open} onClose={onClose} title={title} width="420px" actions={
      <>
        <Button variant="ghost" onClick={onClose}>{cancelText}</Button>
        <Button variant={buttonVariant} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
      </>
    }>
      <div className={`flex items-start gap-3 p-4 rounded-lg ${style.bg}`}>
        <IconAlertCircle className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
        <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
