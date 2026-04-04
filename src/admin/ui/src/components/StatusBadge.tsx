interface StatusBadgeProps {
  status: string;
}

const CONFIG: Record<string, { label: string; bg: string; dot: string; textColor: string }> = {
  published: { label: '已发布', bg: '#ecfdf5', dot: '#10b981', textColor: '#047857' },
  draft:     { label: '草稿',   bg: '#fffbeb', dot: '#f59e0b', textColor: '#b45309' },
  trashed:   { label: '回收站', bg: '#fef2f2', dot: '#ef4444', textColor: '#b91c1c' },
  pending:   { label: '待审核', bg: '#eff6ff', dot: '#3b82f6', textColor: '#1d4ed8' },
  approved:  { label: '已通过', bg: '#ecfdf5', dot: '#10b981', textColor: '#047857' },
  rejected:  { label: '已拒绝', bg: '#fef2f2', dot: '#ef4444', textColor: '#b91c1c' },
  deleted:   { label: '已删除', bg: '#f0f1f3', dot: '#9494a6', textColor: '#5a5a6e' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = CONFIG[status] || { label: status, bg: '#f0f1f3', dot: '#9494a6', textColor: '#5a5a6e' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '7px',
      padding: '3px 12px',
      borderRadius: '999px',
      fontSize: '12px', fontWeight: 600,
      background: c.bg,
      color: c.textColor,
      letterSpacing: '0.02em',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: c.dot,
        boxShadow: `0 0 4px ${c.dot}50`,
      }} />
      {c.label}
    </span>
  );
}
