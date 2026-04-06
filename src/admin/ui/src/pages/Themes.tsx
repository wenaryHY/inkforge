import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { apiData } from '../lib/api';
import type { ThemeConfigField, ThemeSummary } from '../types';
import { useToast } from '../contexts/ToastContext';

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: '14px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
};

const labelMap: Record<string, string> = {
  text: '文本',
  color: '颜色',
  select: '选择',
  number: '数字',
};

export default function Themes() {
  const navigate = useNavigate();
  const toast = useToast();
  const [themes, setThemes] = useState<ThemeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingSlug, setActivatingSlug] = useState<string | null>(null);

  const loadThemes = useCallback(async () => {
    try {
      setLoading(true);
      const items = await apiData<ThemeSummary[]>('/api/admin/themes');
      setThemes(items);
    } catch (error) {
      toast(error instanceof Error ? error.message : '加载主题失败', 'error');
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
      await apiData(`/api/admin/themes/${slug}/activate`, { method: 'POST' });
      toast('主题已切换', 'success');
      await loadThemes();
    } catch (error) {
      toast(error instanceof Error ? error.message : '切换主题失败', 'error');
    } finally {
      setActivatingSlug(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="主题管理"
        subtitle="查看已安装主题，切换当前站点所使用的主题。主题配置接口已预留，后续可继续扩展为动态表单。"
        actions={
          <Button onClick={() => void loadThemes()} disabled={loading} loading={loading}>
            刷新主题
          </Button>
        }
      />

      <section style={sectionStyle}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>当前状态</div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            已接通后端主题扫描与激活 API；上传主题与可视化配置表单暂未实现。
          </div>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>启用中的主题</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--if-text)' }}>{activeTheme?.manifest.name || '未设置'}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{activeTheme?.manifest.slug || '-'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>已扫描主题数</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--if-text)' }}>{themes.length}</div>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>已安装主题</div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            主题来自服务端 themes 目录中的 theme.toml。配置字段目前仅做只读展示。
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          {themes.length === 0 && !loading ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>暂未发现可用主题</div>
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
                          使用中
                        </span>
                      )}
                    </div>

                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {theme.manifest.description || '暂无描述'}
                    </p>

                    <div style={{ display: 'grid', gap: '8px', fontSize: '12.5px' }}>
                      <div style={{ color: 'var(--text-muted)' }}>作者：{theme.manifest.author || '未知'}</div>
                      <div style={{ color: 'var(--text-muted)' }}>最低版本：{theme.manifest.min_inkforge_version || '未声明'}</div>
                      <div style={{ color: 'var(--text-muted)' }}>配置项：{fields.length}</div>
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
                            {key} · {labelMap[field.type] || field.type}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {theme.active ? '当前前台正在使用此主题' : '点击可立即切换为当前主题'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          onClick={() => navigate(`/admin/themes/${theme.manifest.slug}`)}
                          variant="ghost"
                        >
                          详情
                        </Button>
                        <Button
                          onClick={() => void handleActivate(theme.manifest.slug)}
                          disabled={theme.active || activatingSlug !== null}
                          loading={activatingSlug === theme.manifest.slug}
                        >
                          {theme.active ? '已启用' : '启用主题'}
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
