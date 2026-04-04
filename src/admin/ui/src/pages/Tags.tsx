import { useCallback, useEffect, useState } from 'react';
import { apiData } from '../lib/api';
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
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await apiData<Tag[]>('/api/tags'));
    } catch (error) {
      toast(error instanceof Error ? error.message : '���ر�ǩʧ��', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchTags(); }, [fetchTags]);

  async function handleSave() {
    if (!name.trim()) {
      toast('��ǩ���Ʋ���Ϊ��', 'error');
      return;
    }
    try {
      await apiData('/api/admin/tags', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), slug: slug || undefined }),
      });
      toast('����ɹ�', 'success');
      setEditorOpen(false);
      setName('');
      setSlug('');
      await fetchTags();
    } catch (error) {
      toast(error instanceof Error ? error.message : '����ʧ��', 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteTag) return;
    try {
      await apiData(`/api/admin/tags/${deleteTag.id}`, { method: 'DELETE' });
      toast('ɾ���ɹ�', 'success');
      await fetchTags();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'ɾ��ʧ��', 'error');
    } finally {
      setDeleteTag(null);
    }
  }

  function closeEditor() {
    setEditorOpen(false);
    setName('');
    setSlug('');
  }

  return (
    <>
      <PageHeader title="��ǩ����" subtitle={`�� ${items.length} ����ǩ`} actions={<Button onClick={() => setEditorOpen(true)}><IconPlus /> �½���ǩ</Button>} />
      <Card>
        <div className="p-5">
          {loading ? (
            <div className="flex flex-wrap gap-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} width={100} height={36} className="rounded-lg" />)}</div>
          ) : items.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {items.map((tag) => (
                <div key={tag.id} className="group flex items-center gap-2 bg-bg-secondary/80 px-3.5 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-primary-50/50 transition-all duration-150">
                  <span className="font-medium text-sm">{esc(tag.name)}</span>
                  <code className="text-xs text-text-muted bg-white px-1.5 py-0.5 rounded font-mono">{esc(tag.slug)}</code>
                  <button onClick={() => setDeleteTag(tag)} className="w-5 h-5 flex items-center justify-center rounded bg-danger/10 text-danger/60 hover:bg-danger hover:text-white cursor-pointer border-none transition-all duration-150 opacity-0 group-hover:opacity-100">
                    <IconX size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<IconTag size={28} />} message="���ޱ�ǩ" action={<Button size="sm" onClick={() => setEditorOpen(true)}><IconPlus /> ������һ����ǩ</Button>} />
          )}
        </div>
      </Card>

      <ConfirmDialog open={!!deleteTag} onClose={() => setDeleteTag(null)} onConfirm={confirmDelete} title="ɾ����ǩ" message={`ȷ��Ҫɾ����ǩ��${deleteTag?.name || ''}����`} variant="danger" confirmText="ɾ��" />

      <Modal open={editorOpen} onClose={closeEditor} title="�½���ǩ" width="420px" actions={<><Button variant="ghost" onClick={closeEditor}>ȡ��</Button><Button onClick={handleSave}>����</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="����" value={name} onChange={(e) => setName(e.target.value)} placeholder="��ǩ����" />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="������Զ�����" />
        </div>
      </Modal>
    </>
  );
}
