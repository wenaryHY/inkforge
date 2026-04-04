import { IconChevronLeft, IconChevronRight } from './Icons';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

const makeBtnStyle = (): React.CSSProperties => ({
  width: 36, height: 36,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: '1.5px solid var(--if-border)',
  borderRadius: 10,
  background: 'var(--if-bg-card)',
  color: 'var(--if-text-muted)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
});

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 8, paddingTop: 16, paddingBottom: 8,
    }}>
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        style={Object.assign(makeBtnStyle(), { opacity: page <= 1 ? 0.35 : 1 })}
        onMouseEnter={(e) => { if (page > 1) { Object.assign(e.currentTarget.style, { borderColor: 'var(--if-primary)' as string, color: 'var(--if-primary)' as string, background: 'var(--if-primary-50)' as string }); }}
        }
        onMouseLeave={(e) => { if (page > 1) Object.assign(e.currentTarget.style, makeBtnStyle()); if (page <= 1) Object.assign(e.currentTarget.style, { opacity: 0.35 }); }}
      >
        <IconChevronLeft />
      </button>

      <span style={{ fontSize: 14, color: 'var(--if-text-muted)', padding: '0 6px', fontVariantNumeric: 'tabular-nums' as const }}>
        <span style={{ fontWeight: 700, color: 'var(--if-text)', fontSize: 15 }}>{page}</span>
        <span style={{ margin: '0 6px', opacity: 0.4 }}>/</span>{pages}
      </span>

      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
        style={Object.assign(makeBtnStyle(), { opacity: page >= pages ? 0.35 : 1 })}
        onMouseEnter={(e) => { if (page < pages) { Object.assign(e.currentTarget.style, { borderColor: 'var(--if-primary)' as string, color: 'var(--if-primary)' as string, background: 'var(--if-primary-50)' as string }); }}
        }
        onMouseLeave={(e) => { if (page < pages) Object.assign(e.currentTarget.style, makeBtnStyle()); if (page >= pages) Object.assign(e.currentTarget.style, { opacity: 0.35 }); }}
      >
        <IconChevronRight />
      </button>
    </div>
  );
}
