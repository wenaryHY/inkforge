import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { esc } from '../lib/utils';
import type { Setting } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../contexts/ToastContext';

export default function Settings() {
  const toast = useToast();
  const [, setSettings] = useState<Setting[]>([]);
  const [kv, setKv] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/api/admin/settings').then((r) => {
      if (r.code === 0) {
        const s: Setting[] = r.data as Setting[] || [];
        setSettings(s);
        const m: Record<string, string> = {};
        s.forEach((item: Setting) => m[item.key] = item.value);
        setKv(m);
      }
    });
  }, []);

  function update(key: string, value: string) { setKv(prev => ({ ...prev, [key]: value })); }

  async function handleSave() {
    setSaving(true);
    const items: [string, string][] = [
      ['site_title', kv.site_title || ''],
      ['site_description', kv.site_description || ''],
      ['site_url', kv.site_url || ''],
      ['posts_per_page', kv.posts_per_page || '10'],
      ['allow_register', kv.allow_register || 'false'],
      ['allow_comment', kv.allow_comment || 'false'],
    ];
    for (const [key, value] of items) {
      await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ key, value }) });
    }
    toast('设置已保存', 'success');
    setSaving(false);
  }

  return (
    <>
      <PageHeader title="网站设置" subtitle="配置你的站点基本信息"
        actions={<Button onClick={handleSave} disabled={saving} loading={saving}>保存设置</Button>} />

      <Card header={<h3 className="text-sm font-semibold text-text-main">基本信息</h3>}>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="站点标题" value={esc(kv.site_title || '')} onChange={(e) => update('site_title', e.target.value)} placeholder="我的博客" />
            <Input label="站点描述" value={esc(kv.site_description || '')} onChange={(e) => update('site_description', e.target.value)} placeholder="记录生活，分享技术" />
            <Input label="站点 URL" value={esc(kv.site_url || '')} onChange={(e) => update('site_url', e.target.value)} placeholder="http://localhost:3000" />
            <Input label="每页文章数" type="number" value={esc(kv.posts_per_page || '10')} onChange={(e) => update('posts_per_page', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card header={<h3 className="text-sm font-semibold text-text-main">功能开关</h3>}>
        <div className="p-5">
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-3 cursor-pointer text-sm p-3 rounded-lg hover:bg-bg-secondary transition-colors duration-150">
              <input type="checkbox" checked={kv.allow_register === 'true'}
                onChange={(e) => update('allow_register', e.checked ? 'true' : 'false')}
                className="w-4 h-4 accent-primary rounded" />
              <span className="text-text-main">允许公开注册</span>
              <span className={`ml-auto text-xs font-mono font-medium px-2 py-0.5 rounded ${kv.allow_register === 'true' ? 'bg-success-bg text-emerald-700' : 'bg-bg-secondary text-text-muted'}`}>
                {kv.allow_register === 'true' ? 'ON' : 'OFF'}
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-sm p-3 rounded-lg hover:bg-bg-secondary transition-colors duration-150">
              <input type="checkbox" checked={kv.allow_comment === 'true'}
                onChange={(e) => update('allow_comment', e.checked ? 'true' : 'false')}
                className="w-4 h-4 accent-primary rounded" />
              <span className="text-text-main">允许评论</span>
              <span className={`ml-auto text-xs font-mono font-medium px-2 py-0.5 rounded ${kv.allow_comment === 'true' ? 'bg-success-bg text-emerald-700' : 'bg-bg-secondary text-text-muted'}`}>
                {kv.allow_comment === 'true' ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>
        </div>
      </Card>
    </>
  );
}
