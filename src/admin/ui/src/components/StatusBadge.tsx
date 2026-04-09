interface StatusBadgeProps {
  status: string;
}

/* ── MD3 chip 风格：语义色彩保持含义不变 ──
   绿色=成功/通过，黄色=警告/待处理，红色=危险/拒绝，灰色=禁用/已删除
*/
const CONFIG: Record<string, { label: string; bg: string; dot: string; textColor: string }> = {
  published: { label: '已发布', bg: 'var(--success-50)',  dot: 'var(--success-500)', textColor: 'var(--success-700)' },
  draft:     { label: '草稿',   bg: 'var(--warning-50)',  dot: 'var(--warning-500)', textColor: 'var(--warning-700)' },
  trashed:   { label: '回收站', bg: 'var(--danger-50)',   dot: 'var(--danger-500)',  textColor: 'var(--danger-700)' },
  pending:   { label: '待审核', bg: 'var(--warning-50)',  dot: 'var(--warning-500)', textColor: 'var(--warning-700)' },
  approved:  { label: '已通过', bg: 'var(--success-50)',  dot: 'var(--success-500)', textColor: 'var(--success-700)' },
  rejected:  { label: '已拒绝', bg: 'var(--danger-50)',   dot: 'var(--danger-500)',  textColor: 'var(--danger-700)' },
  deleted:   { label: '已删除', bg: 'var(--md-surface-container)', dot: 'var(--md-outline)', textColor: 'var(--md-on-surface-variant)' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = CONFIG[status] || { label: status, bg: 'var(--md-surface-container)', dot: 'var(--md-outline)', textColor: 'var(--md-on-surface-variant)' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      minWidth: '72px',
      borderRadius: 'var(--radius-full)',
      fontSize: '12px',
      fontWeight: 600,
      background: c.bg,
      color: c.textColor,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
      justifyContent: 'center',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: c.dot,
        flexShrink: 0,
      }} />
      {c.label}
    </span>
  );
}
