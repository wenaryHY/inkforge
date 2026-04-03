import type { ReactNode } from 'react';

type StatsTheme = 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'violet';

const themeConfig: Record<StatsTheme, { bg: string; iconBg: string }> = {
  indigo:   { bg: 'bg-indigo-50',  iconBg: 'from-indigo-500 to-indigo-600' },
  emerald:  { bg: 'bg-emerald-50', iconBg: 'from-emerald-500 to-emerald-600' },
  amber:    { bg: 'bg-amber-50',   iconBg: 'from-amber-500 to-amber-500' },
  blue:     { bg: 'bg-blue-50',    iconBg: 'from-blue-500 to-blue-600' },
  rose:     { bg: 'bg-rose-50',    iconBg: 'from-rose-500 to-rose-600' },
  violet:   { bg: 'bg-violet-50',  iconBg: 'from-violet-500 to-violet-600' },
};

interface StatsCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  theme?: StatsTheme;
}

export function StatsCard({ icon, value, label, theme = 'indigo' }: StatsCardProps) {
  const config = themeConfig[theme];
  return (
    <div className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${config.iconBg} shadow-sm`}>
          <span className="text-white">{icon}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-text-main leading-tight">{value}</div>
      <div className="text-xs text-text-muted mt-1 font-medium">{label}</div>
    </div>
  );
}
