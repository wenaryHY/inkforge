import type { ReactNode } from 'react';

type StatsTheme = 'orange' | 'emerald' | 'amber' | 'blue' | 'rose' | 'violet';

const THEME_MAP: Record<StatsTheme, { iconBg: string; accent: string }> = {
  orange:  { iconBg: 'linear-gradient(135deg, #ff6b35, #e55a28)',   accent: '#ff6b35' },
  emerald: { iconBg: 'linear-gradient(135deg, #10b981, #059669)',   accent: '#10b981' },
  amber:   { iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',   accent: '#f59e0b' },
  blue:    { iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',   accent: '#3b82f6' },
  rose:    { iconBg: 'linear-gradient(135deg, #f43f5e, #e11d48)',   accent: '#f43f5e' },
  violet:  { iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',   accent: '#8b5cf6' },
};

interface StatsCardProps {
  icon: ReactNode;
  value: number | string;
  label: string;
  theme?: StatsTheme;
}

export function StatsCard({ icon, value, label, theme = 'orange' }: StatsCardProps) {
  const t = THEME_MAP[theme];

  return (
    <div style={{
      background: 'var(--if-bg-card)',
      borderRadius: '14px',
      padding: '20px 22px',
      border: '1px solid var(--if-border-light)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.03)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: t.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
        }}
        >{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--if-text)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--if-text-muted)', marginTop: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}
