import { IconChevronLeft, IconChevronRight } from './Icons';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

const makeBtnStyle = (): React.CSSProperties => ({
  width: '36px', height: '36px',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 'var(--radius-full)',
  background: 'var(--md-surface-container-low)',
  color: 'var(--md-on-surface-variant)',
  cursor: 'pointer',
  transition: 'background 0.15s var(--ease-default), color 0.15s var(--ease-default)',
  outline: 'none',
});

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const applyHover = (el: HTMLElement) => {
    Object.assign(el.style, {
      background: 'var(--md-primary-container)' as string,
      color: 'var(--md-on-primary-container)' as string,
    });
  };

  const resetHover = (el: HTMLElement) => {
    Object.assign(el.style, {
      background: 'var(--md-surface-container-low)' as string,
      color: 'var(--md-on-surface-variant)' as string,
    });
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '8px', paddingTop: '16px', paddingBottom: '8px',
    }}>
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        style={Object.assign(makeBtnStyle(), { opacity: page <= 1 ? 0.35 : 1 })}
        onMouseEnter={(e) => { if (page > 1) applyHover(e.currentTarget); }}
        onMouseLeave={(e) => { if (page > 1) resetHover(e.currentTarget); }}
      >
        <IconChevronLeft />
      </button>

      <span style={{ fontSize: '14px', color: 'var(--md-outline)', padding: '0 8px', fontVariantNumeric: 'tabular-nums' as const }}>
        <span style={{ fontWeight: 700, color: 'var(--md-on-surface)', fontSize: '15px' }}>{page}</span>
        <span style={{ margin: '0 6px', opacity: 0.4 }}>/</span>{pages}
      </span>

      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
        style={Object.assign(makeBtnStyle(), { opacity: page >= pages ? 0.35 : 1 })}
        onMouseEnter={(e) => { if (page < pages) applyHover(e.currentTarget); }}
        onMouseLeave={(e) => { if (page < pages) resetHover(e.currentTarget); }}
      >
        <IconChevronRight />
      </button>
    </div>
  );
}
