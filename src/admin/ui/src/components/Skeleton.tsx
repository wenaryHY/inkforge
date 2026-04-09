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
  /** 附加样式 */
  style?: React.CSSProperties;
}

/** 单个骨架屏元素 */
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  style,
}: SkeletonProps) {
  const baseClass = 'if-shimmer';

  switch (variant) {
    case 'circular':
      return <div className={`rounded-full ${baseClass} ${className}`} style={{ width: width || 40, height: height || 40, background: 'var(--md-surface-container)', ...style }} />;
    case 'rectangular':
      return <div className={`${baseClass} ${className}`} style={{ width: width || '100%', height: height || 100, borderRadius: 'var(--radius-md)', background: 'var(--md-surface-container)', ...style }} />;
    default:
      return <div className={`${baseClass} ${className}`} style={{ width: width || '100%', height: height || 16, borderRadius: 'var(--radius-sm)', background: 'var(--md-surface-container)', ...style }} />;
  }
}

/** 文章列表骨架屏 */
export function PostsSkeleton() {
  return (
    <div className="space-y-[16px]">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-[16px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ background: 'var(--md-surface-container-low)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <Skeleton variant="circular" width={40} height={40} className="mb-[12px]" />
            <Skeleton width="60%" height={28} className="mb-[4px]" />
            <Skeleton width="40%" height={14} />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div style={{ background: 'var(--md-surface-container-low)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: 'var(--md-surface-container-highest)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Skeleton width={120} height={20} />
          <Skeleton width={80} height={14} className="ml-auto" />
        </div>
        <div>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px', background: i > 0 ? 'var(--md-surface-container-highest)' : 'transparent', marginTop: i > 0 ? '1px' : 0 }}>
              <Skeleton width={180} height={16} className="flex-shrink-0" />
              <Skeleton width={60} height={14} className="flex-shrink-0" />
              <Skeleton width={70} height={22} className="flex-shrink-0" style={{ borderRadius: 'var(--radius-full)' }} />
              <Skeleton width={40} height={14} className="flex-shrink-0" />
              <Skeleton width={90} height={14} className="flex-shrink-0" />
              <div className="ml-auto flex gap-[8px]">
                <Skeleton width={48} height={28} style={{ borderRadius: 'var(--radius-sm)' }} />
                <Skeleton width={48} height={28} style={{ borderRadius: 'var(--radius-sm)' }} />
                <Skeleton width={48} height={28} style={{ borderRadius: 'var(--radius-sm)' }} />
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
    <div style={{ background: 'var(--md-surface-container-low)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', background: 'var(--md-surface-container-highest)' }}>
        <Skeleton width={140} height={20} />
      </div>
      {/* Rows */}
      <div>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid gap-[16px]"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr) auto`, padding: '12px 16px', background: i > 0 ? 'var(--md-surface-container-highest)' : 'transparent', marginTop: i > 0 ? '1px' : 0 }}>
            {[...Array(cols)].map((_, j) => (
              <Skeleton key={j} width={j === 0 ? '70%' : '50%'} height={16} />
            ))}
            <Skeleton width={80} height={28} style={{ borderRadius: 'var(--radius-sm)', justifySelf: 'end' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
