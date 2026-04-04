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

const BG_MAP = { danger: '#fef2f2', warning: '#fffbeb', info: '#eff6ff' };
const ICON_COLOR = { danger: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };

export function ConfirmDialog({
  open, onClose, onConfirm,
  title = '确认操作', message,
  confirmText = '确认', cancelText = '取消',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open} onClose={onClose} title={title} width="420px"
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>{cancelText}</Button>
          <Button variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'}
            onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        padding: '16px', borderRadius: '12px',
        background: BG_MAP[variant],
      }}>
        <IconAlertCircle size={22} style={{ color: ICON_COLOR[variant], flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '14px', color: 'var(--if-text-secondary)', lineHeight: 1.65 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}
