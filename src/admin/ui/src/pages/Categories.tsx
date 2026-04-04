import { useCallback, useEffect, useState } from 'react';
import { apiData } from '../lib/api';
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

/* 样式 */
const TH = {
  padding: '14px 20px', textAlign: 'left' as const, fontSize: '11.5px',
  fontWeight: 700, color: 'var(--if-text-muted)', textTransform: 'uppercase' as const,
  letterSpacing: '0.06em', background: 'var(--if-bg-secondary)',
  borderBottom: '2px solid var(--if-border-light)',
};
const TD = {
  padding: '15px 20px', fontSize: '13.5px', color: 'var(--if-text)',
  borderBottom: '1px solid var(--if-border-light)', verticalAlign: 'middle',
};

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

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try { setItems(await apiData<Category[]>('/api/categories')); }
    catch (error) { toast(error instanceof Error ? error.message : '加载分类失败', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { void fetchCategories(); }, [fetchCategories]);

  function openEditor(item?: Category) {
    setEditing(item || null); setName(item?.name || ''); setSlug(item?.slug || '');
    setDesc(item?.description || ''); setEditorOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) { toast('分类名称不能为空', 'error'); return; }
    try {
      const body = { name: name.trim(), slug: slug || undefined, description: desc || null };
      if (editing?.id) await apiData(`/api/admin/categories/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      else await apiData('/api/admin/categories', { method: 'POST', body: JSON.stringify(body) });
      toast('保存成功', 'success'); setEditorOpen(false); await fetchCategories();
    } catch (error) { toast(error instanceof Error ? error.message : '保存失败', 'error'); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiData(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' });
      toast('删除成功', 'success'); await fetchCategories();
    } catch (error) { toast(error instanceof Error ? error.message : '删除失败', 'error'); }
    finally { setDeleteTarget(null); }
  }

  if (loading) return <CardTableSkeleton cols={3} rows={4} />;

  return (
    <>
      <PageHeader title="分类管理" subtitle={`共 ${items.length} 个分类`}
        actions={<Button onClick={() => openEditor()}><IconPlus /> 新建分类</Button>} />

      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={TH}>名称</th><th style={TH}>Slug</th><th style={TH}>描述</th><th style={TH}>操作</th>
          </tr></thead>
          <tbody>
            {items.length > 0 ? items.map((cat) => (
              <tr key={cat.id}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--if-primary-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{ transition: 'background 0.12s ease' }}
              >
                <td style={{ ...TD, fontWeight: 600 }}>{esc(cat.name)}</td>
                <td style={TD}><span style={{
                  background: 'var(--if-bg-secondary)', padding: '3px 8px', borderRadius: '6px',
                  fontSize: '12px', fontFamily: 'monospace', color: 'var(--if-text-muted)',
                }}>{esc(cat.slug)}</span></td>
                <td style={{ ...TD, color: 'var(--if-text-secondary)' }}>{esc(cat.description || '—')}</td>
                <td style={TD}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Button size="sm" variant="ghost" onClick={() => openEditor(cat)}><IconPencil /></Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}><IconTrash2 /></Button>
                  </div>
                </td>
              </tr>
            )) : (<tr><td colSpan={4}><EmptyState icon={<IconFolderOpen size={28} />} message="暂无分类" /></td></tr>)}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="删除分类" message={`确定要删除分类「${deleteTarget?.name || ''}」吗？`} variant="danger" />

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editing ? '编辑分类' : '新建分类'}
        actions={<><Button variant="ghost" onClick={() => setEditorOpen(false)}>取消</Button><Button onClick={handleSave}>保存</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Input label="名称" value={name} onChange={(e) => setName(e.target.value)} placeholder="分类名称" />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="可选，URL别名" />
          <Textarea label="描述" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="可选，简要描述" minRows={3} />
        </div>
      </Modal>
    </>
  );
}
