import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { esc } from '../lib/utils';
import type { Category } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { EmptyState } from '../components/EmptyState';
import { CardTableSkeleton } from '../components/Skeleton';
import { IconFolderOpen, IconPlus, IconPencil, IconTrash2 } from '../components/Icons';
import { useToast } from '../contexts/ToastContext';

export default function Categories() {
  const toast = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const r = await api('/api/categories');
    if (r.code === 0) setItems(r.data as Category[] || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  function openEditor(item?: Category) {
    setEditing(item || null); setName(item?.name || ''); setSlug(item?.slug || '');
    setDesc(item?.description || ''); setEditorOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) { toast('名称不能为空', 'error'); return; }
    const body = { name: name.trim(), slug, description: desc };
    const method = editing?.id ? 'PUT' : 'POST';
    const path = editing?.id ? '/api/category/update?id=' + editing.id : '/api/categories';
    const r = await api(path, { method, body: JSON.stringify(body) });
    if (r && r.code === 0) { toast('保存成功', 'success'); setEditorOpen(false); fetch(); }
    else { toast(r?.message || '保存失败', 'error'); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const r = await api('/api/category/delete?id=' + deleteTarget.id, { method: 'DELETE' });
    if (r && r.code === 0) { toast('删除成功', 'success'); fetch(); }
    else toast(r?.message || '删除失败', 'error');
    setDeleteTarget(null);
  }

  if (loading) return <CardTableSkeleton cols={3} rows={4} />;

  return (
    <>
      <PageHeader title="分类管理" subtitle={`共 ${items.length} 个分类`}
        actions={<Button onClick={() => openEditor()}><IconPlus /> 新建分类</Button>} />
      <Card>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="th-cell">名称</th>
              <th className="th-cell">Slug</th>
              <th className="th-cell">描述</th>
              <th className="th-cell">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map(c => (
              <tr key={c.id} className="table-row-hover">
                <td className="td-cell"><span className="font-medium">{esc(c.name)}</span></td>
                <td className="td-cell"><code className="bg-bg-secondary px-2 py-0.5 rounded text-xs text-text-muted font-mono">{esc(c.slug)}</code></td>
                <td className="td-cell text-text-secondary text-sm">{esc(c.description || '—')}</td>
                <td className="td-cell">
                  <div className="flex gap-1.5 items-center">
                    <Button size="sm" variant="ghost" onClick={() => openEditor(c)}><IconPencil /></Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget({ id: c.id, name: c.name })}><IconTrash2 /></Button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4}><EmptyState icon={<IconFolderOpen size={28} />} message="暂无分类" /></td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="删除分类" message={`确定要删除分类「${deleteTarget?.name}」吗？该分类下的文章将变为无分类。`} variant="danger" />

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)}
        title={editing ? '编辑分类' : '新建分类'}
        actions={<><Button variant="ghost" onClick={() => setEditorOpen(false)}>取消</Button><Button onClick={handleSave}>保存</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="名称" value={name} onChange={(e) => setName(e.target.value)} placeholder="分类名称" />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="自动生成（留空即可）" />
          <Textarea label="描述" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="简要描述分类" minRows={3} />
        </div>
      </Modal>
    </>
  );
}
