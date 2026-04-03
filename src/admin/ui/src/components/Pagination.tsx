import { IconChevronLeft, IconChevronRight } from './Icons';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center gap-2 justify-center mt-4 py-3">
      <button
        className="w-9 h-9 rounded-lg bg-white border border-border text-text-muted hover:bg-primary/5 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed text-sm cursor-pointer transition-all duration-150 flex items-center justify-center"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <IconChevronLeft />
      </button>
      <span className="text-sm text-text-muted px-3 font-medium tabular-nums">
        <span className="text-text-main font-bold">{page}</span>
        <span className="mx-1.5 text-text-muted/60">/</span>
        {pages}
      </span>
      <button
        className="w-9 h-9 rounded-lg bg-white border border-border text-text-muted hover:bg-primary/5 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed text-sm cursor-pointer transition-all duration-150 flex items-center justify-center"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <IconChevronRight />
      </button>
    </div>
  );
}
