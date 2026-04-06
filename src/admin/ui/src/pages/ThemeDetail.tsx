import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { getThemeDetail, saveThemeConfig, activateTheme } from '../lib/api';
import type { ThemeDetailResponse, ThemeConfigField } from '../types';
import { useToast } from '../contexts/ToastContext';

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: '14px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
};

export default function ThemeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const toast = useToast();

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
      toast(error instanceof Error ? error.message : '加载主题详情失败', 'error');
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
      toast('配置已保存', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : '保存配置失败', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleActivate() {
    if (!slug) return;
    try {
      setActivating(true);
      await activateTheme(slug);
      toast('主题已激活', 'success');
      await loadDetail();
    } catch (error) {
      toast(error instanceof Error ? error.message : '激活主题失败', 'error');
    } finally {
      setActivating(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>;
  }

  if (!detail) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>主题不存在</div>;
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
              激活主题
            </Button>
            <Button onClick={() => navigate('/admin/themes')} variant="ghost">
              返回列表
            </Button>
          </div>
        }
      />

      <section style={sectionStyle}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>主题信息</div>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>标识</div>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--if-text)' }}>{manifest.slug}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>版本</div>
            <div style={{ fontSize: '14px', color: 'var(--if-text)' }}>v{manifest.version}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>作者</div>
            <div style={{ fontSize: '14px', color: 'var(--if-text)' }}>{manifest.author || '未知'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>最低版本</div>
            <div style={{ fontSize: '14px', color: 'var(--if-text)' }}>{manifest.min_inkforge_version || '未声明'}</div>
          </div>
        </div>
      </section>

      {Object.keys(schema).length > 0 && (
        <section style={sectionStyle}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>主题配置</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              编辑主题的配置参数，修改后点击保存生效。
            </div>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(schema).map(([key, field]) => (
              <ThemeConfigFieldInput
                key={key}
                field={field}
                value={formData[key]}
                onChange={(val) => setFormData({ ...formData, [key]: val })}
              />
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button onClick={() => void handleSave()} loading={saving}>
                保存配置
              </Button>
              <Button onClick={() => setFormData(detail.config)} variant="ghost">
                重置
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
}

function ThemeConfigFieldInput({ field, value, onChange }: ThemeConfigFieldInputProps) {
  if (field.type === 'text') {
    return (
      <Input
        label={field.label}
        value={(value as string) || field.default || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.default ? `默认: ${field.default}` : ''}
      />
    );
  }

  if (field.type === 'color') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
              border: '1.5px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
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
        placeholder={field.default ? `默认: ${field.default}` : ''}
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
        <option value="">-- 请选择 --</option>
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
