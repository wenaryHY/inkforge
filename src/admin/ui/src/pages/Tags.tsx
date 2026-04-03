import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { esc } from '../lib/utils';
import type { Tag } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Input } from '../components/Input';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { IconTag, IconPlus, IconX } from '../components/Icons';
import { useToast } from '../contexts/ToastContext';

export default function Tags() {
  const toast = useToast();
  const [items, setItems] = useState<Tag[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const r = await api('/api/tags');
    if (r.code === 0) setItems(r.data as Tag[] || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleSave() {
    if (!name.trim()) { toast('名称不能为空', 'error'); return; }
    const r = await api('/api/tags', { method: 'POST', body: JSON.stringify({ name: name.trim(), slug }) });
    if (r && r.code === 0) {
      toast('保存成功', 'success'); setEditorOpen(false); setName(''); setSlug(''); fetch();
    } else { toast(r?.message || '保存失败', 'error'); }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const r = await api('/api/tag/delete?id=' + deleteId, { method: 'DELETE' });
    if (r && r.code === 0) { toast('删除成功', 'success'); fetch(); }
    else toast(r?.message || '删除失败', 'error');
    setDeleteId(null);
  }

  function closeEditor() { setEditorOpen(false); setName(''); setSlug(''); }

  return (
    <>
      <PageHeader title="标签管理" subtitle={`共 ${items.length} 个标签`}
        actions={<Button onClick={() => setEditorOpen(true)}><IconPlus /> 新建标签</Button>} />
      <Card>
        <div className="p-5">
          {loading ? (
            <div className="flex flex-wrap gap-2.5">
              {[...Array(6)].map((_, i) => <Skeleton key={i} width={100} height={36} className="rounded-lg" />)}
            </div>
          ) : items.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {items.map(t => (
                <div key={t.id} className="group flex items-center gap-2 bg-bg-secondary/80 px-3.5 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary-50/50 transition-all duration-150">
                  <span className="font-medium text-sm">{esc(t.name)}</span>
                  <code className="text-xs text-text-muted bg-white px-1.5 py-0.5 rounded font-mono">{esc(t.slug)}</code>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-danger/10 text-danger/60 hover:bg-danger hover:text-white cursor-pointer border-none transition-all duration-150 opacity-0 group-hover:opacity-100"
                  >
                    <IconX size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<IconTag size={28} />} message="暂无标签" action={<Button size="sm" onClick={() => setEditorOpen(true)}><IconPlus /> 创建第一个标签</Button>} />
          )}
        </div>
      </Card>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete}
        title="删除标签" message="确定要删除这个标签吗？" variant="danger" confirmText="删除" />

      <Modal open={editorOpen} onClose={closeEditor}
        title="新建标签" width="420px"
        actions={<><Button variant="ghost" onClick={closeEditor}>取消</Button><Button onClick={handleSave}>保存</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="名称" value={name} onChange={(e) => setName(e.target.value)} placeholder="标签名称" />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="自动生成（留空即可）" />
        </div>
      </Modal>
    </>
  );
}
