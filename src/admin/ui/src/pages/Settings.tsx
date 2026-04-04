import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiData } from '../lib/api';
import type { Setting, ThemeSummary } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useToast } from '../contexts/ToastContext';

export default function Settings() {
  const toast = useToast();
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
      settingItems.forEach((item) => {
        nextKv[item.key] = item.value;
      });
      setKv(nextKv);
    } catch (error) {
      toast(error instanceof Error ? error.message : '加载设置失败', 'error');
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  function update(key: string, value: string) {
    setKv((prev) => ({ ...prev, [key]: value }));
  }

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

      for (const [key, value] of items) {
        await apiData('/api/admin/settings', { method: 'PATCH', body: JSON.stringify({ key, value }) });
      }

      if (kv.active_theme) {
        await apiData(`/api/admin/themes/${kv.active_theme}/activate`, { method: 'POST' });
      }

      toast('设置已保存', 'success');
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : '保存设置失败', 'error');
    } finally {
      setSaving(false);
    }
  }

  const activeThemeOptions = useMemo(
    () => themes.map((theme) => ({ value: theme.manifest.slug, label: theme.manifest.name })),
    [themes],
  );

  return (
    <>
      <PageHeader
        title="站点设置"
        subtitle="配置站点、评论和主题基础选项"
        actions={<Button onClick={handleSave} disabled={saving} loading={saving}>保存设置</Button>}
      />

      <Card header={<h3 className="text-sm font-semibold text-text-main">基础信息</h3>}>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="站点标题" value={kv.site_title || ''} onChange={(e) => update('site_title', e.target.value)} placeholder="InkForge" />
            <Input label="站点描述" value={kv.site_description || ''} onChange={(e) => update('site_description', e.target.value)} placeholder="A personal blog powered by InkForge" />
            <Input label="站点 URL" value={kv.site_url || ''} onChange={(e) => update('site_url', e.target.value)} placeholder="http://localhost:3000" />
            <Input label="评论最大长度" type="number" value={kv.comment_max_length || '2000'} onChange={(e) => update('comment_max_length', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card header={<h3 className="text-sm font-semibold text-text-main">评论与注册</h3>}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="公开注册" value={kv.allow_register || 'true'} onChange={(e) => update('allow_register', e.target.value)}>
            <option value="true">允许</option>
            <option value="false">关闭</option>
          </Select>
          <Select label="允许评论" value={kv.allow_comment || 'true'} onChange={(e) => update('allow_comment', e.target.value)}>
            <option value="true">允许</option>
            <option value="false">关闭</option>
          </Select>
          <Select label="评论需要登录" value={kv.comment_require_login || 'true'} onChange={(e) => update('comment_require_login', e.target.value)}>
            <option value="true">是</option>
            <option value="false">否</option>
          </Select>
          <Select label="评论审核策略" value={kv.comment_moderation_mode || 'all'} onChange={(e) => update('comment_moderation_mode', e.target.value)}>
            <option value="all">全部待审</option>
            <option value="first_comment">首条待审</option>
            <option value="none">无需审核</option>
          </Select>
        </div>
      </Card>

      <Card header={<h3 className="text-sm font-semibold text-text-main">主题</h3>}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="默认主题" value={kv.active_theme || activeThemeOptions[0]?.value || 'default'} onChange={(e) => update('active_theme', e.target.value)}>
            {activeThemeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
          <Select label="默认模式" value={kv.theme_default_mode || 'system'} onChange={(e) => update('theme_default_mode', e.target.value)}>
            <option value="system">跟随系统</option>
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </Select>
        </div>
      </Card>

      <Card header={<h3 className="text-sm font-semibold text-text-main">已安装主题</h3>}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((theme) => (
            <div key={theme.manifest.slug} className={`rounded-xl border p-4 ${theme.active ? 'border-primary bg-primary-50/50' : 'border-border bg-bg-secondary/50'}`}>
              <div className="font-semibold text-text-main">{theme.manifest.name}</div>
              <div className="text-xs text-text-muted mt-1">{theme.manifest.slug} · {theme.manifest.version}</div>
              <div className="text-sm text-text-secondary mt-2">{theme.manifest.description}</div>
              <div className="text-xs text-text-muted mt-3">作者：{theme.manifest.author}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
