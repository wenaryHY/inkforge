import { IconChevronLeft, IconChevronRight } from './Icons';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

const makeBtnStyle = (): React.CSSProperties => ({
  width: '36px', height: '36px',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  border: '1.5px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-card)',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  outline: 'none',
});

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '8px', paddingTop: '16px', paddingBottom: '8px',
    }}>
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        style={Object.assign(makeBtnStyle(), { opacity: page <= 1 ? 0.35 : 1 })}
        onMouseEnter={(e) => {
          if (page > 1) {
            Object.assign(e.currentTarget.style, {
              borderColor: 'var(--primary-500)' as string,
              color: 'var(--primary-600)' as string,
              background: 'var(--primary-50)' as string,
            });
          }
        }}
        onMouseLeave={(e) => {
          if (page > 1) Object.assign(e.currentTarget.style, makeBtnStyle());
          if (page <= 1) Object.assign(e.currentTarget.style, { opacity: 0.35 });
        }}
      >
        <IconChevronLeft />
      </button>

      <span style={{ fontSize: '14px', color: 'var(--text-muted)', padding: '0 8px', fontVariantNumeric: 'tabular-nums' as const }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{page}</span>
        <span style={{ margin: '0 6px', opacity: 0.4 }}>/</span>{pages}
      </span>

      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
        style={Object.assign(makeBtnStyle(), { opacity: page >= pages ? 0.35 : 1 })}
        onMouseEnter={(e) => {
          if (page < pages) {
            Object.assign(e.currentTarget.style, {
              borderColor: 'var(--primary-500)' as string,
              color: 'var(--primary-600)' as string,
              background: 'var(--primary-50)' as string,
            });
          }
        }}
        onMouseLeave={(e) => {
          if (page < pages) Object.assign(e.currentTarget.style, makeBtnStyle());
          if (page >= pages) Object.assign(e.currentTarget.style, { opacity: 0.35 });
        }}
      >
        <IconChevronRight />
      </button>
    </div>
  );
}
