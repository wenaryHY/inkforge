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
    try { setItems(await apiData<Tag[]>('/api/tags')); }
    catch (error) { toast(error instanceof Error ? error.message : '加载标签失败', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { void fetchTags(); }, [fetchTags]);

  async function handleSave() {
    if (!name.trim()) { toast('标签名称不能为空', 'error'); return; }
    try {
      await apiData('/api/admin/tags', { method: 'POST', body: JSON.stringify({ name: name.trim(), slug: slug || undefined }) });
      toast('保存成功', 'success');
      setEditorOpen(false);
      setName(''); setSlug('');
      await fetchTags();
    } catch (error) { toast(error instanceof Error ? error.message : '保存失败', 'error'); }
  }

  async function confirmDelete() {
    if (!deleteTag) return;
    try {
      await apiData(`/api/admin/tags/${deleteTag.id}`, { method: 'DELETE' });
      toast('删除成功', 'success');
      await fetchTags();
    } catch (error) { toast(error instanceof Error ? error.message : '删除失败', 'error'); }
    finally { setDeleteTag(null); }
  }

  function closeEditor() { setEditorOpen(false); setName(''); setSlug(''); }

  const tagStyleBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1.5px solid var(--if-border)',
    fontSize: '13px',
    fontWeight: 600,
    background: 'var(--if-bg-card)',
    cursor: 'default',
    transition: 'all 0.16s ease',
  };

  return (
    <>
      <PageHeader title="标签管理" subtitle={`共 ${items.length} 个标签`}
        actions={<Button onClick={() => setEditorOpen(true)}><IconPlus /> 新建标签</Button>} />

      <Card>
        <div style={{ padding: '22px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} width={100} height={36} className="rounded-lg" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {items.map((tag) => (
                <div
                  key={tag.id}
                  style={tagStyleBase}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = 'var(--if-primary)';
                    e.currentTarget.style.background = 'var(--if-primary-50)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = 'var(--if-border)';
                    e.currentTarget.style.background = 'var(--if-bg-card)';
                  }}
                >
                  <span>{esc(tag.name)}</span>
                  <code style={{
                    fontSize: '11px', fontFamily: 'monospace', color: 'var(--if-text-muted)',
                    background: 'var(--if-bg-secondary)', padding: '2px 6px', borderRadius: '5px',
                  }}>{esc(tag.slug)}</code>
                  <button
                    onClick={() => setDeleteTag(tag)}
                    style={{
                      width: '20px', height: '20px', borderRadius: '6px', border: 'none',
                      background: 'transparent', color: '#ef444480', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      opacity: 0,
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.background = '#fef2f2';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.opacity = '0';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ef444480';
                    }}
                  ><IconX size={11} /></button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<IconTag size={28} />} message="暂无标签"
              action={<Button size="sm" onClick={() => setEditorOpen(true)}><IconPlus /> 创建第一个标签</Button>} />
          )}
        </div>
      </Card>

      <ConfirmDialog open={!!deleteTag} onClose={() => setDeleteTag(null)} onConfirm={confirmDelete}
        title="删除标签" message={`确定要删除标签「${deleteTag?.name || ''}」吗？`} variant="danger" confirmText="删除" />

      <Modal open={editorOpen} onClose={closeEditor} title="新建标签" width="420px"
        actions={
          <>
            <Button variant="ghost" onClick={closeEditor}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Input label="名称" value={name} onChange={(e) => setName(e.target.value)} placeholder="标签名称" />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="可选，URL别名" />
        </div>
      </Modal>
    </>
  );
}
