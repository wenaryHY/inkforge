/**
 * Skeleton 骨架屏组件 — 替代 "加载中..." 文字
 */
interface SkeletonProps {
  className?: string;
  /** 骨架屏类型 */
  variant?: 'text' | 'circular' | 'rectangular';
  /** 宽度 (仅 text) */
  width?: string | number;
  /** 高度 */
  height?: string | number;
}

/** 单个骨架屏元素 */
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gradient-to-r from-bg-secondary via-bg to-bg-secondary bg-[length:200%_100%] shimmer';

  switch (variant) {
    case 'circular':
      return <div className={`rounded-full ${baseClass} ${className}`} style={{ width: width || 40, height: height || 40 }} />;
    case 'rectangular':
      return <div className={`rounded-lg ${baseClass} ${className}`} style={{ width: width || '100%', height: height || 100 }} />;
    default:
      return <div className={`rounded ${baseClass} ${className}`} style={{ width: width || '100%', height: height || 16 }} />;
  }
}

/** 文章列表骨架屏 */
export function PostsSkeleton() {
  return (
    <div className="space-y-[16px]">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-[16px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-[20px] border border-border">
            <Skeleton variant="circular" width={40} height={40} className="mb-[12px]" />
            <Skeleton width="60%" height={28} className="mb-[4px]" />
            <Skeleton width="40%" height={14} />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-[20px] py-[16px] border-b border-border-light flex items-center gap-[8px]">
          <Skeleton width={120} height={20} />
          <Skeleton width={80} height={14} className="ml-auto" />
        </div>
        <div className="divide-y divide-border-light">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center px-[16px] py-[12px] gap-[16px]">
              <Skeleton width={180} height={16} className="flex-shrink-0" />
              <Skeleton width={60} height={14} className="flex-shrink-0" />
              <Skeleton width={70} height={22} className="flex-shrink-0 rounded-full" />
              <Skeleton width={40} height={14} className="flex-shrink-0" />
              <Skeleton width={90} height={14} className="flex-shrink-0" />
              <div className="ml-auto flex gap-[8px]">
                <Skeleton width={48} height={28} className="rounded-md" />
                <Skeleton width={48} height={28} className="rounded-md" />
                <Skeleton width={48} height={28} className="rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 通用卡片骨架屏 — 用于 Categories/Tags 等页面 */
export function CardTableSkeleton({ cols = 4, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-[20px] py-[16px] border-b border-border-light">
        <Skeleton width={140} height={20} />
      </div>
      {/* Rows */}
      <div className="divide-y divide-border-light">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid gap-[16px] px-[16px] py-[12px]"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr) auto` }}>
            {[...Array(cols)].map((_, j) => (
              <Skeleton key={j} width={j === 0 ? '70%' : '50%'} height={16} />
            ))}
            <Skeleton width={80} height={28} className="rounded-md justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  );
}
