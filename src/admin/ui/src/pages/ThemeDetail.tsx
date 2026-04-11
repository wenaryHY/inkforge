import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { getThemeDetail, saveThemeConfig, activateTheme } from '../lib/api';
import type { ThemeDetailResponse, ThemeConfigField } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useI18n } from '../i18n';

const sectionStyle: React.CSSProperties = {
  background: 'var(--md-surface-container-lowest)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
};

export default function ThemeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, format } = useI18n();

  const [detail, setDetail] = useState<ThemeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const loadDetail = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const data = await getThemeDetail(slug);
      setDetail(data);
      setFormData(data.config || {});
    } catch (error) {
      toast(error instanceof Error ? error.message : t('loadThemeDetailFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }, [slug, toast]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  async function handleSave() {
    if (!slug) return;
    try {
      setSaving(true);
      await saveThemeConfig(slug, formData);
      toast(t('saveThemeConfigSuccess'), 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : t('saveThemeConfigFailed'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate() {
    if (!slug) return;
    try {
      setActivating(true);
      await activateTheme(slug);
      toast(t('activateThemeSuccess'), 'success');
      await loadDetail();
    } catch (error) {
      toast(error instanceof Error ? error.message : t('activateThemeFailed'), 'error');
    } finally {
      setActivating(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{t('loading')}</div>;
  }

  if (!detail) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--md-outline)' }}>{t('themeNotFound')}</div>;
  }

  const { manifest, schema } = detail;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={manifest.name}
        subtitle={manifest.description}
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={() => void handleActivate()}
              loading={activating}
              variant="primary"
            >
              {t('activateTheme')}
            </Button>
            <Button onClick={() => navigate('/themes')} variant="ghost">
              {t('backToList')}
            </Button>
          </div>
        }
      />

      <section style={sectionStyle}>
        <div style={{ padding: '20px 24px', background: 'var(--md-surface-container-low)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--md-on-surface)' }}>{t('themeInfo')}</div>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--md-outline)', marginBottom: '6px' }}>{t('identifierLabel')}</div>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--md-on-surface)' }}>{manifest.slug}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--md-outline)', marginBottom: '6px' }}>{t('versionLabel')}</div>
            <div style={{ fontSize: '14px', color: 'var(--md-on-surface)' }}>v{manifest.version}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--md-outline)', marginBottom: '6px' }}>{t('authorText')}</div>
            <div style={{ fontSize: '14px', color: 'var(--md-on-surface)' }}>{manifest.author || t('unknown')}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--md-outline)', marginBottom: '6px' }}>{t('minVersionText')}</div>
            <div style={{ fontSize: '14px', color: 'var(--md-on-surface)' }}>{manifest.min_inkforge_version || t('undeclared')}</div>
          </div>
        </div>
      </section>

      {Object.keys(schema).length > 0 && (
        <section style={sectionStyle}>
          <div style={{ padding: '20px 24px', background: 'var(--md-surface-container-low)' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--md-on-surface)' }}>{t('themeConfig')}</div>
            <div style={{ fontSize: '12.5px', color: 'var(--md-outline)', marginTop: '4px' }}>
              {t('themeConfigDesc')}
            </div>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(schema).map(([key, field]) => (
              <ThemeConfigFieldInput
                key={key}
                field={field}
                value={formData[key]}
                onChange={(val) => setFormData({ ...formData, [key]: val })}
                t={t}
                format={format}
              />
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button onClick={() => void handleSave()} loading={saving}>
                {t('saveConfig')}
              </Button>
              <Button onClick={() => setFormData(detail.config)} variant="ghost">
                {t('resetConfig')}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

interface ThemeConfigFieldInputProps {
  field: ThemeConfigField;
  value: unknown;
  onChange: (val: unknown) => void;
  t: (key: string) => string;
  format: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
}

function ThemeConfigFieldInput({ field, value, onChange, t, format }: ThemeConfigFieldInputProps) {
  if (field.type === 'text') {
    return (
      <Input
        label={field.label}
        value={(value as string) || field.default || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.default ? format('defaultValuePrefix', { value: field.default }) : ''}
      />
    );
  }

  if (field.type === 'color') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--md-on-surface-variant)' }}>
          {field.label}
        </label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="color"
            value={(value as string) || field.default || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '60px',
              height: '40px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              background: 'var(--md-surface-container)',
            }}
          />
          <span style={{ fontSize: '13px', color: 'var(--md-on-surface-variant)', fontFamily: 'monospace' }}>
            {(value as string) || field.default || '#000000'}
          </span>
        </div>
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <Input
        label={field.label}
        type="number"
        value={(value as number) || field.default || 0}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        placeholder={field.default ? format('defaultValuePrefix', { value: field.default }) : ''}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <Select
        label={field.label}
        value={(value as string) || field.default || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t('pleaseSelectOption')}</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    );
  }

  return null;
}
