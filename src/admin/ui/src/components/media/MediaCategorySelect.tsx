import { Select } from '../Select';
import type { MediaCategory } from '../../types';

interface MediaCategorySelectProps {
  categories: MediaCategory[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  includeEmpty?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
}

export function MediaCategorySelect({
  categories,
  value,
  onChange,
  label,
  placeholder,
  includeEmpty = true,
  emptyLabel = '无分类',
  disabled = false,
}: MediaCategorySelectProps) {
  return (
    <Select
      label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {includeEmpty && <option value="">{placeholder || emptyLabel}</option>}
      {categories.map((category) => (
        <option key={category.id} value={category.slug}>
          {category.name}
        </option>
      ))}
    </Select>
  );
}
