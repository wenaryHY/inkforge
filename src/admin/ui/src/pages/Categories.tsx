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
    try {
      setItems(await apiData<Category[]>('/api/categories'));
    } catch (error) {
      toast(error instanceof Error ? error.message : '���ط���ʧ��', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchCategories(); }, [fetchCategories]);

  function openEditor(item?: Category) {
    setEditing(item || null);
    setName(item?.name || '');
    setSlug(item?.slug || '');
    setDesc(item?.description || '');
    setEditorOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast('�������Ʋ���Ϊ��', 'error');
      return;
    }
    try {
      const body = { name: name.trim(), slug: slug || undefined, description: desc || null };
      if (editing?.id) {
        await apiData(`/api/admin/categories/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await apiData('/api/admin/categories', { method: 'POST', body: JSON.stringify(body) });
      }
      toast('����ɹ�', 'success');
      setEditorOpen(false);
      await fetchCategories();
    } catch (error) {
      toast(error instanceof Error ? error.message : '����ʧ��', 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiData(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' });
      toast('ɾ���ɹ�', 'success');
      await fetchCategories();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'ɾ��ʧ��', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) return <CardTableSkeleton cols={3} rows={4} />;

  return (
    <>
      <PageHeader title="�������" subtitle={`�� ${items.length} ������`} actions={<Button onClick={() => openEditor()}><IconPlus /> �½�����</Button>} />
      <Card>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="th-cell">����</th>
              <th className="th-cell">Slug</th>
              <th className="th-cell">����</th>
              <th className="th-cell">����</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? items.map((category) => (
              <tr key={category.id} className="table-row-hover">
                <td className="td-cell"><span className="font-medium">{esc(category.name)}</span></td>
                <td className="td-cell"><code className="bg-bg-secondary px-2 py-0.5 rounded text-xs text-text-muted font-mono">{esc(category.slug)}</code></td>
                <td className="td-cell text-text-secondary text-sm">{esc(category.description || '��')}</td>
                <td className="td-cell">
                  <div className="flex gap-1.5 items-center">
                    <Button size="sm" variant="ghost" onClick={() => openEditor(category)}><IconPencil /></Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget({ id: category.id, name: category.name })}><IconTrash2 /></Button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4}><EmptyState icon={<IconFolderOpen size={28} />} message="���޷���" /></td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="ɾ������" message={`ȷ��Ҫɾ�����ࡶ${deleteTarget?.name || ''}����`} variant="danger" />

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)} title={editing ? '�༭����' : '�½�����'} actions={<><Button variant="ghost" onClick={() => setEditorOpen(false)}>ȡ��</Button><Button onClick={handleSave}>����</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="����" value={name} onChange={(e) => setName(e.target.value)} placeholder="��������" />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="������Զ�����" />
          <Textarea label="����" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="��Ҫ��������" minRows={3} />
        </div>
      </Modal>
    </>
  );
}
