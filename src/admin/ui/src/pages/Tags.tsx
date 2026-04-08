import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { IconTag, IconPlus, IconPencil, IconTrash2, IconCheck } from '../components/Icons';
import { useToast } from '../contexts/ToastContext';

/* ═════════════ 样式常量 ═════════════ */
const tagCardBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  borderRadius: '10px',
  border: '1.5px solid var(--border-default)',
  fontSize: '13px',
  fontWeight: 600,
  background: 'var(--bg-card)',
  transition: 'all 0.16s ease',
  cursor: 'default',
};

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '28px', height: '28px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  flexShrink: 0,
};

/* ═════════════ 主组件 ═════════════ */
export default function Tags() {
  const toast = useToast();
  const [items, setItems] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal 状态：新建或编辑
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);

  // 删除状态
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);

  // 批量选择状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try { setItems(await apiData<Tag[]>('/api/tags')); }
    catch (error) { toast(error instanceof Error ? error.message : '加载标签失败', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { void fetchTags(); }, [fetchTags]);

  // 打开新建
  function openCreate() {
    setEditingTag(null);
    setName('');
    setSlug('');
    setEditorOpen(true);
  }

  // 打开编辑
  function openEdit(tag: Tag) {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug || '');
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingTag(null);
    setName('');
    setSlug('');
    setSaving(false);
  }

  async function handleSave() {
    if (!name.trim()) { toast('标签名称不能为空', 'error'); return; }
    setSaving(true);
    try {
      if (editingTag) {
        // 编辑模式
        await apiData(`/api/admin/tags/${editingTag.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: name.trim(), slug: slug || undefined })
        });
        toast('更新成功', 'success');
      } else {
        // 新建模式
        await apiData('/api/admin/tags', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), slug: slug || undefined })
        });
        toast('创建成功', 'success');
      }
      closeEditor();
      await fetchTags();
    } catch (error) {
      toast(error instanceof Error ? error.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTag) return;
    try {
      await apiData(`/api/admin/tags/${deleteTag.id}`, { method: 'DELETE' });
      toast('删除成功', 'success');
      setSelectedIds(prev => { const next = new Set(prev); next.delete(deleteTag.id); return next; });
      await fetchTags();
    } catch (error) {
      toast(error instanceof Error ? error.message : '删除失败', 'error');
    } finally {
      setDeleteTag(null);
    }
  }

  // 批量删除
  async function handleBatchDelete() {
    setBatchDeleteOpen(true);
  }

  async function confirmBatchDelete() {
    try {
      await Promise.all(
        [...selectedIds].map(id =>
          apiData(`/api/admin/tags/${id}`, { method: 'DELETE' })
        )
      );
      toast(`成功删除 ${selectedIds.size} 个标签`, 'success');
      setSelectedIds(new Set());
      await fetchTags();
    } catch (error) {
      toast(error instanceof Error ? error.message : '批量删除失败', 'error');
    } finally {
      setBatchDeleteOpen(false);
    }
  }

  // 选择逻辑
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(t => t.id)));
    }
  }

  return (
    <>
      <PageHeader
        title="标签管理"
        subtitle={`共 ${items.length} 个标签`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedIds.size > 0 && (
              <Button variant="danger" onClick={handleBatchDelete}>
                <IconTrash2 size={14} /> 批量删除 ({selectedIds.size})
              </Button>
            )}
            <Button onClick={openCreate}><IconPlus size={14} /> 新建标签</Button>
          </div>
        }
      />

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }}>
        <button
          style={{
            padding: '10px 4px', fontSize: '14px', fontWeight: 600, color: 'var(--primary-600)',
            borderBottom: '2px solid var(--primary-500)', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
          }}
        >
          活跃标签
        </button>
        <button
          onClick={() => navigate('/admin/trash?tab=tag')}
          style={{
            padding: '10px 4px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)',
            borderBottom: '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          已删除
        </button>
      </div>

      <Card>
        <div style={{ padding: '22px' }}>
          {/* 全选行 */}
          {!loading && items.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '16px', paddingBottom: '16px',
              borderBottom: '1px solid var(--border-light)',
            }}>
              <button
                onClick={toggleSelectAll}
                style={{
                  width: '18px', height: '18px',
                  borderRadius: '4px',
                  border: `1.5px solid ${selectedIds.size === items.length ? 'var(--primary-500)' : 'var(--border-default)'}`,
                  background: selectedIds.size === items.length ? 'var(--primary-500)' : 'transparent',
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {selectedIds.size === items.length && <IconCheck size={12} color="#fff" />}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {selectedIds.size > 0 ? `已选择 ${selectedIds.size} 项` : '全选'}
              </span>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} width={100} height={36} className="rounded-lg" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {items.map((tag) => {
                const isSelected = selectedIds.has(tag.id);
                return (
                  <div
                    key={tag.id}
                    style={{
                      ...tagCardBase,
                      borderColor: isSelected ? 'var(--primary-500)' : 'var(--border-default)',
                      background: isSelected ? 'var(--primary-50)' : 'var(--bg-card)',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--primary-400)';
                        e.currentTarget.style.background = 'var(--primary-50)';
                      }
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-default)';
                        e.currentTarget.style.background = 'var(--bg-card)';
                      }
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(tag.id)}
                      style={{
                        width: '16px', height: '16px',
                        borderRadius: '4px',
                        border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-default)'}`,
                        background: isSelected ? 'var(--primary-500)' : 'transparent',
                        cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        padding: 0, flexShrink: 0,
                      }}
                    >
                      {isSelected && <IconCheck size={10} color="#fff" />}
                    </button>

                    {/* 标签名 */}
                    <span style={{ color: 'var(--if-text)' }}>{esc(tag.name)}</span>

                    {/* Slug */}
                    <code style={{
                      fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)',
                      background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '5px',
                    }}>{esc(tag.slug || '')}</code>

                    {/* 操作按钮 - 隐藏直到 hover */}
                    <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
                      <button
                        onClick={() => openEdit(tag)}
                        title="编辑标签"
                        style={{
                          ...iconBtn,
                          background: 'transparent', color: '#6b7280',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.currentTarget.style.background = '#ecfdf5';
                          e.currentTarget.style.color = '#10b981';
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#6b7280';
                        }}
                      ><IconPencil size={13} /></button>
                      <button
                        onClick={() => setDeleteTag(tag)}
                        title="删除标签"
                        style={{
                          ...iconBtn,
                          background: 'transparent', color: '#6b7280',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.currentTarget.style.background = '#fef2f2';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#6b7280';
                        }}
                      ><IconTrash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<IconTag size={28} />} message="暂无标签"
              action={<Button size="sm" onClick={openCreate}><IconPlus size={14} /> 创建第一个标签</Button>} />
          )}
        </div>
      </Card>

      {/* 单个删除确认 */}
      <ConfirmDialog
        open={!!deleteTag}
        onClose={() => setDeleteTag(null)}
        onConfirm={confirmDelete}
        title="删除标签"
        message={`确定要删除标签「${deleteTag?.name || ''}」吗？`}
        variant="danger"
        confirmText="删除"
      />

      {/* 批量删除确认 */}
      <ConfirmDialog
        open={batchDeleteOpen}
        onClose={() => setBatchDeleteOpen(false)}
        onConfirm={confirmBatchDelete}
        title="批量删除标签"
        message={`确定要删除选中的 ${selectedIds.size} 个标签吗？此操作不可恢复。`}
        variant="danger"
        confirmText={`删除 ${selectedIds.size} 个`}
      />

      {/* 新建/编辑 Modal */}
      <Modal
        open={editorOpen}
        onClose={closeEditor}
        title={editingTag ? '编辑标签' : '新建标签'}
        width="420px"
        actions={
          <>
            <Button variant="ghost" onClick={closeEditor}>取消</Button>
            <Button onClick={handleSave} disabled={saving} loading={saving}>保存</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Input
            label="名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="标签名称"
            autoFocus
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="可选，URL 别名，将从名称自动生成"
          />
        </div>
      </Modal>
    </>
  );
}
