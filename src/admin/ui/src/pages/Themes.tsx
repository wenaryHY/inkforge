import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { apiData, API_PREFIX } from '../lib/api';
import type { ThemeConfigField, ThemeSummary } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useI18n } from '../i18n';

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: '14px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
};

const labelMap = (t: (key: string) => string): Record<string, string> => ({
  text: t('fieldTypeText'),
  color: t('fieldTypeColor'),
  select: t('fieldTypeSelect'),
  number: t('fieldTypeNumber'),
});

export default function Themes() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t, format } = useI18n();
  const [themes, setThemes] = useState<ThemeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingSlug, setActivatingSlug] = useState<string | null>(null);

  const loadThemes = useCallback(async () => {
    try {
      setLoading(true);
      const items = await apiData<ThemeSummary[]>(`${API_PREFIX}/admin/themes`);
      setThemes(items);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('loadThemesFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadThemes();
  }, [loadThemes]);

  const activeTheme = useMemo(() => themes.find((item) => item.active), [themes]);

  async function handleActivate(slug: string) {
    try {
      setActivatingSlug(slug);
      await apiData(`${API_PREFIX}/admin/themes/${slug}/activate`, { method: 'POST' });
      toast(t('switchThemeSuccess'), 'success');
      await loadThemes();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('switchThemeFailed'), 'error');
    } finally {
      setActivatingSlug(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={t('themesTitle')}
        subtitle={t('themesSubtitle')}
        actions={
          <Button onClick={() => void loadThemes()} disabled={loading} loading={loading}>
            {t('refreshThemes')}
          </Button>
        }
      />

      <section style={sectionStyle}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>{t('currentStatus')}</div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('currentStatusDesc')}
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('activeThemeLabel')}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--if-text)' }}>{activeTheme?.manifest.name || t('notSet')}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{activeTheme?.manifest.slug || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('scannedThemeCount')}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--if-text)' }}>{themes.length}</div>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>{t('installedThemesTitle')}</div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('installedThemesDesc')}
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          {themes.length === 0 && !loading ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('noThemes')}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {themes.map((theme) => {
                const fields = Object.entries(theme.manifest.config || {}) as Array<[string, ThemeConfigField]>;
                return (
                  <article
                    key={theme.manifest.slug}
                    style={{
                      border: `1px solid ${theme.active ? 'rgba(255,107,53,0.35)' : 'var(--border-default)'}`,
                      borderRadius: '14px',
                      background: theme.active ? 'rgba(255,107,53,0.04)' : 'var(--bg-card)',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: theme.active ? '0 6px 18px rgba(255,107,53,0.08)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: theme.active ? '#ff6b35' : 'var(--if-text)' }}>
                          {theme.manifest.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                          {theme.manifest.slug} · v{theme.manifest.version}
                        </div>
                      </div>
                      {theme.active && (
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: 'rgba(255,107,53,0.12)',
                          color: '#ff6b35',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}>
                          {t('inUse')}
                        </span>
                      )}
                    </div>

                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {theme.manifest.description || t('noDescription')}
                    </p>

                    <div style={{ display: 'grid', gap: '8px', fontSize: '12.5px' }}>
                      <div style={{ color: 'var(--text-muted)' }}>{format('authorLabel', { value: theme.manifest.author || t('unknown') })}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{format('minVersionLabel', { value: theme.manifest.min_inkforge_version || t('undeclared') })}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{format('configCountLabel', { count: fields.length })}</div>
                    </div>

                    {fields.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {fields.slice(0, 6).map(([key, field]) => (
                          <span
                            key={key}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '999px',
                              background: 'var(--bg-subtle)',
                              color: 'var(--text-secondary)',
                              fontSize: '11px',
                              border: '1px solid var(--border-light)',
                            }}
                          >
                            {key} · {labelMap(t)[field.type] || field.type}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {theme.active ? t('themeCurrentlyActive') : t('themeSwitchHint')}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          onClick={() => navigate(`/themes/${theme.manifest.slug}`)}
                          variant="ghost"
                        >
                          {t('themeDetail')}
                        </Button>
                        <Button
                          onClick={() => void handleActivate(theme.manifest.slug)}
                          disabled={theme.active || activatingSlug !== null}
                          loading={activatingSlug === theme.manifest.slug}
                        >
                          {theme.active ? t('themeEnabled') : t('enableTheme')}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
