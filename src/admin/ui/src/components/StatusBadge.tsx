interface StatusBadgeProps {
  status: string;
}

const config: Record<string, { label: string; className: string; dotClass: string }> = {
  published: { label: '�ѷ���', className: 'bg-success-bg/70 text-emerald-700 border border-success-border/60', dotClass: '!bg-emerald-500' },
  draft: { label: '�ݸ�', className: 'bg-warning-bg/70 text-amber-700 border border-warning-border/60', dotClass: '!bg-amber-500' },
  trashed: { label: '����վ', className: 'bg-danger-bg/70 text-red-700 border border-danger-border/60', dotClass: '!bg-red-500' },
  pending: { label: '�����', className: 'bg-info-bg/70 text-blue-700 border border-info-border/60', dotClass: '!bg-blue-500' },
  approved: { label: '��ͨ��', className: 'bg-success-bg/70 text-emerald-700 border border-success-border/60', dotClass: '!bg-emerald-500' },
  rejected: { label: '�Ѿܾ�', className: 'bg-danger-bg/70 text-red-700 border border-danger-border/60', dotClass: '!bg-red-500' },
  deleted: { label: '��ɾ��', className: 'bg-bg-secondary text-text-muted border border-border', dotClass: '!bg-text-muted' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status] || { label: status, className: 'bg-bg-secondary text-text-muted border border-border', dotClass: '!bg-text-muted' };
  return (
    <span className={`inline-flex items-center gap-[6px] px-[10px] py-[3px] rounded-full text-xs font-semibold ${c.className}`}>
      <span className={`w-[5px] h-[5px] rounded-full bg-current ${c.dotClass}`} />
      {c.label}
    </span>
  );
}
