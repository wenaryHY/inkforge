import type { ReactNode } from 'react';

type StatsTheme = 'orange' | 'emerald' | 'amber' | 'blue' | 'rose' | 'violet';

/* ── 设计指南：语义色彩应用有目的性，不纯装饰 ── */
const THEME_MAP: Record<StatsTheme, { iconBg: string; accent: string; accentBg: string }> = {
  orange:  { iconBg: 'var(--primary-500)',       accent: 'var(--primary-600)',   accentBg: 'var(--primary-50)' },
  emerald: { iconBg: 'var(--success-500)',        accent: 'var(--success-600)',  accentBg: 'var(--success-50)' },
  amber:   { iconBg: 'var(--warning-500)',        accent: 'var(--warning-600)',  accentBg: 'var(--warning-50)' },
  blue:    { iconBg: 'var(--info-500)',           accent: 'var(--info-600)',     accentBg: 'var(--info-50)' },
  rose:    { iconBg: '#f43f5e',                   accent: '#e11d48',             accentBg: '#fff1f2' },
  violet:  { iconBg: '#8b5cf6',                   accent: '#7c3aed',             accentBg: '#f5f3ff' },
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
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      border: '1px solid var(--border-light)',
      /* 弱化阴影 — 不应成为视觉焦点 */
      boxShadow: 'var(--elevation-1)',
      transition: 'box-shadow 0.2s cubic-bezier(0.4,0,0.2,1), transform 0.2s cubic-bezier(0.4,0,0.2,1)',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = 'var(--elevation-2)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'var(--elevation-1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
          background: t.accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.accent,
        }}>{icon}</div>
      </div>
      {/* ── 设计指南：后台界面字号不超过 24px，数值不应喧宾夺主 ── */}
      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.02em' }}>
        {label}
      </div>
    </div>
  );
}
