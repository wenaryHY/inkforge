import type { CSSProperties } from 'react';
import type { MediaCategory } from '../../types';

interface MediaCategoryBadgeProps {
  category?: Pick<MediaCategory, 'name' | 'icon' | 'color'> | null;
  fallbackLabel?: string;
}

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
};

const iconStyle: CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '12px',
  flexShrink: 0,
};

export function MediaCategoryBadge({ category, fallbackLabel = '未分类' }: MediaCategoryBadgeProps) {
  const label = category?.name || fallbackLabel;
  const iconText = (category?.icon?.trim() || label.slice(0, 1) || 'M').slice(0, 2).toUpperCase();

  return (
    <span style={badgeStyle}>
      <span style={{ ...iconStyle, background: category?.color || 'var(--bg-subtle)' }}>
        {iconText}
      </span>
      <span style={{ fontWeight: 600, color: 'var(--if-text)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </span>
  );
}
