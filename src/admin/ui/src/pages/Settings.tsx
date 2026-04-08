import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiData, getToken } from '../lib/api';
import type { Setting, ThemeSummary } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useToast } from '../contexts/ToastContext';

/* 样式常量 */
const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-light)',
  borderRadius: '14px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
  marginBottom: '20px',
  overflow: 'hidden',
};
const secHeadStyle: React.CSSProperties = {
  padding: '18px 24px', borderBottom: '1px solid var(--border-light)',
};
const secTitleStyle: React.CSSProperties = {
  fontSize: '15px', fontWeight: 700, color: 'var(--if-text)', letterSpacing: '-0.2px',
};
const secDescStyle: React.CSSProperties = { fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '3px' };
const secBodyStyle: React.CSSProperties = { padding: '24px', display: 'flex', flexDirection: 'column' as const, gap: '18px' };
const formRowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px', alignItems: 'start' };
const labelStyle: React.CSSProperties = { fontSize: '13.5px', fontWeight: 600, color: 'var(--text-secondary)', paddingTop: '10px' };
const hintStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--text-muted)', opacity: 0.8 };

function SettingSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={sectionStyle}>
      <div style={secHeadStyle}>
        <h3 style={secTitleStyle}>{title}</h3>
        {description && <p style={secDescStyle}>{description}</p>}
      </div>
      <div style={secBodyStyle}>{children}</div>
    </div>
  );
}

function FormRow({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={formRowStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '5px' }}>
        {children}
        {hint && <span style={hintStyle}>{hint}</span>}
      </div>
    </div>
  );
}

export default function Settings() {
  const toast = useToast();
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [themes, setThemes] = useState<ThemeSummary[]>([]);
  const [kv, setKv] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [settingItems, themeItems] = await Promise.all([
        apiData<Setting[]>('/api/admin/settings'),
        apiData<ThemeSummary[]>('/api/admin/themes'),
      ]);
      setThemes(themeItems);
      const nextKv: Record<string, string> = {};
      settingItems.forEach((item) => { nextKv[item.key] = item.value; });
      setKv(nextKv);
    } catch (error) { toast(error instanceof Error ? error.message : '加载设置失败', 'error'); }
  }, [toast]);

  useEffect(() => { void load(); }, [load]);

  function update(key: string, value: string) { setKv((prev) => ({ ...prev, [key]: value })); }

  async function handleSave() {
    setSaving(true);
    try {
      const items: Array<[string, string]> = [
        ['site_title', kv.site_title || ''],
        ['site_description', kv.site_description || ''],
        ['site_url', kv.site_url || ''],
        ['allow_register', kv.allow_register || 'true'],
        ['allow_comment', kv.allow_comment || 'true'],
        ['comment_require_login', kv.comment_require_login || 'true'],
        ['comment_moderation_mode', kv.comment_moderation_mode || 'all'],
        ['comment_max_length', kv.comment_max_length || '2000'],
        ['theme_default_mode', kv.theme_default_mode || 'system'],
      ];
      for (const [key, value] of items) await apiData('/api/admin/settings', { method: 'PATCH', body: JSON.stringify({ key, value }) });
      if (kv.active_theme) await apiData(`/api/admin/themes/${kv.active_theme}/activate`, { method: 'POST' });
      toast('设置已保存', 'success');
      await load();
    } catch (error) { toast(error instanceof Error ? error.message : '保存设置失败', 'error'); }
    finally { setSaving(false); }
  }

  const activeThemeOptions = useMemo(() => themes.map((t) => ({ value: t.manifest.slug, label: t.manifest.name })), [themes]);

  return (
    <>
      <PageHeader title="站点设置" subtitle="管理博客的基础配置、评论规则和主题外观"
        actions={<Button onClick={handleSave} disabled={saving} loading={saving}>保存更改</Button>} />

      <SettingSection title="基础信息" description="站点名称、描述等核心信息">
        <FormRow label="站点标题">
          <Input value={kv.site_title || ''} onChange={(e) => update('site_title', e.target.value)} placeholder="InkForge" />
        </FormRow>
        <FormRow label="站点描述" hint="用于 SEO 和页面 meta 描述，建议不超过 160 字符">
          <Input value={kv.site_description || ''} onChange={(e) => update('site_description', e.target.value)} placeholder="A personal blog powered by InkForge" />
        </FormRow>
        <FormRow label="站点 URL" hint="博客的完整访问地址，包含协议前缀">
          <Input value={kv.site_url || ''} onChange={(e) => update('site_url', e.target.value)} placeholder="https://example.com" />
        </FormRow>
      </SettingSection>

      <SettingSection title="评论与注册" description="控制用户交互和内容审核策略">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '18px' }}>
            <FormRow label="公开注册">
              <Select value={kv.allow_register || 'true'} onChange={(e) => update('allow_register', e.target.value)}>
                <option value="true">允许新用户注册</option><option value="false">关闭注册</option>
              </Select>
            </FormRow>
            <FormRow label="允许评论">
              <Select value={kv.allow_comment || 'true'} onChange={(e) => update('allow_comment', e.target.value)}>
                <option value="true">允许评论</option><option value="false">全局关闭评论</option>
              </Select>
            </FormRow>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '18px' }}>
            <FormRow label="评论需登录">
              <Select value={kv.comment_require_login || 'true'} onChange={(e) => update('comment_require_login', e.target.value)}>
                <option value="true">是 — 仅登录可评论</option><option value="false">否 — 游客也可评论</option>
              </Select>
            </FormRow>
            <FormRow label="审核策略">
              <Select value={kv.comment_moderation_mode || 'all'} onChange={(e) => update('comment_moderation_mode', e.target.value)}>
                <option value="all">全部待审</option><option value="first_comment">首条待审，后续放行</option><option value="none">无需审核，直接发布</option>
              </Select>
            </FormRow>
          </div>
        </div>
        <FormRow label="评论最大长度" hint="单条评论允许的最大字符数">
          <Input type="number" value={kv.comment_max_length || '2000'} onChange={(e) => update('comment_max_length', e.target.value)} />
        </FormRow>
      </SettingSection>

      <SettingSection title="主题与外观" description="切换和管理已安装的前台主题">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '18px' }}>
            <FormRow label="当前主题">
              <Select value={kv.active_theme || activeThemeOptions[0]?.value || 'default'}
                onChange={(e) => update('active_theme', e.target.value)}>
                {activeThemeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </FormRow>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '18px' }}>
            <FormRow label="默认模式">
              <Select value={kv.theme_default_mode || 'system'} onChange={(e) => update('theme_default_mode', e.target.value)}>
                <option value="system">跟随系统</option><option value="light">浅色模式</option><option value="dark">深色模式</option>
              </Select>
            </FormRow>
          </div>
        </div>

        {/* 已安装主题 */}
        <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '16px' }}>
            已安装的主题
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {themes.map((theme) => (
              <div
                key={theme.manifest.slug}
                style={{
                  border: `1.5px solid ${theme.active ? 'rgba(255,107,53,0.4)' : 'var(--border-default)'}`,
                  borderRadius: '10px',
                  padding: '18px', transition: 'all 0.2s ease',
                  background: theme.active ? 'rgba(255,107,53,0.03)' : 'var(--bg-card)',
                  position: 'relative',
                  boxShadow: theme.active ? '0 2px 12px rgba(255,107,53,0.08)' : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!theme.active) { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.06)'; }
                }}
                onMouseLeave={(e) => {
                  if (!theme.active) { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }
                }}
              >
                {theme.active && (
                  <span style={{
                    position: 'absolute', top: '-9px', right: '16px',
                    background: 'linear-gradient(135deg, #ff6b35, #e55a28)',
                    color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.06em',
                    textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(255,107,53,0.3)',
                  }}>使用中</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '11px',
                    background: theme.active ? 'rgba(255,107,53,0.10)' : 'var(--bg-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
                  }}>📄</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: theme.active ? '#ff6b35' : 'var(--if-text)' }}>{theme.manifest.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '1px' }}>v{theme.manifest.version} · {theme.manifest.slug}</div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{theme.manifest.description}</p>
                <div style={{ marginTop: '14px', paddingTop: '13px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>作者：{theme.manifest.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingSection>

      {/* 数据备份 */}
      <SettingSection
        title="数据备份"
        description="导出或导入完整的 SQLite 数据库文件，包含文章、评论、用户等全部数据"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={() => {
                const token = getToken();
                fetch('/api/admin/backup/list', {
                  headers: { Authorization: `Bearer ${token}` },
                })
                  .then((r) => r.json())
                  .then((json) => {
                    if (json.code !== 0 || !json.data || json.data.length === 0) {
                      throw new Error('没有可用的备份');
                    }
                    const backup = json.data[0];
                    return fetch(`/api/admin/backup/${backup.id}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                  })
                  .then((r) => {
                    if (!r.ok) throw new Error('下载失败');
                    return r.blob();
                  })
                  .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `inkforge_backup_${new Date().toISOString().slice(0, 10)}.zip`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast('备份文件已开始下载', 'success');
                  })
                  .catch((e) => toast(e instanceof Error ? e.message : '备份失败', 'error'));
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              下载数据库备份
            </Button>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              备份包含文章、评论、用户、媒体等全部数据
            </span>
          </div>

          <div style={{ paddingTop: '4px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              导入备份
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                ref={restoreInputRef}
                type="file"
                accept=".zip"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!window.confirm(`即将用 "${file.name}" 替换当前数据库，原数据库会备份为 .bak 文件。是否继续？`)) {
                    return;
                  }
                  const formData = new FormData();
                  formData.append('file', file);
                  const token = getToken();
                  fetch('/api/admin/backup/restore', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                  })
                    .then((r) => r.json())
                    .then((json) => {
                      if (json.code === 0) {
                        toast('备份导入成功，页面将刷新...', 'success');
                        setTimeout(() => location.reload(), 1500);
                      } else {
                        toast(json.message || '导入失败', 'error');
                      }
                    })
                    .catch((e) => toast(e instanceof Error ? e.message : '导入失败', 'error'))
                    .finally(() => {
                      if (restoreInputRef.current) restoreInputRef.current.value = '';
                    });
                }}
              />
              <Button
                variant="ghost"
                onClick={() => restoreInputRef.current?.click()}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                选择备份文件导入
              </Button>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                仅支持 SQLite 数据库文件（.db / .sqlite / .sqlite3），导入前会自动备份原数据库
              </span>
            </div>
          </div>
        </div>
      </SettingSection>
    </>
  );
}
