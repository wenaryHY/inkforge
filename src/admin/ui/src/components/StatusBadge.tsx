interface StatusBadgeProps {
  status: string;
}

/* ── 设计指南：语义色彩 — 每种颜色都有明确含义 ──
   绿色=成功/通过，黄色=警告/待处理，红色=危险/拒绝，蓝色=信息/中性，灰色=禁用/已删除
*/
const CONFIG: Record<string, { label: string; bg: string; dot: string; textColor: string }> = {
  published: { label: '已发布', bg: 'var(--success-50)',  dot: 'var(--success-500)', textColor: 'var(--success-700)' },
  draft:     { label: '草稿',   bg: 'var(--warning-50)',  dot: 'var(--warning-500)', textColor: 'var(--warning-700)' },
  trashed:   { label: '回收站', bg: 'var(--danger-50)',   dot: 'var(--danger-500)',  textColor: 'var(--danger-700)' },
  /* pending: 从蓝色改为黄色 — 待审核≠中性信息，而是需要关注=警告 */
  pending:   { label: '待审核', bg: 'var(--warning-50)',  dot: 'var(--warning-500)', textColor: 'var(--warning-700)' },
  approved:  { label: '已通过', bg: 'var(--success-50)',  dot: 'var(--success-500)', textColor: 'var(--success-700)' },
  rejected:  { label: '已拒绝', bg: 'var(--danger-50)',   dot: 'var(--danger-500)',  textColor: 'var(--danger-700)' },
  deleted:   { label: '已删除', bg: 'var(--bg-subtle)',   dot: 'var(--text-muted)',  textColor: 'var(--text-secondary)' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = CONFIG[status] || { label: status, bg: 'var(--bg-subtle)', dot: 'var(--text-muted)', textColor: 'var(--text-secondary)' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
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
        boxShadow: `0 0 4px ${c.dot}40`,
        flexShrink: 0,
      }} />
      {c.label}
    </span>
  );
}
