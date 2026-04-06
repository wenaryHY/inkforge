import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { CardTableSkeleton } from '../components/Skeleton';
import { useToast } from '../contexts/ToastContext';
import { useMediaCategories } from '../hooks/useMediaCategories';
import type { CreateMediaCategoryRequest, MediaCategory, UpdateMediaCategoryRequest } from '../types';
import { esc } from '../lib/utils';
import { IconFolder, IconPlus, IconEdit2, IconTrash2 } from '../components/Icons';

const TH = {
  padding: '14px 16px',
  textAlign: 'left' as const,
  fontSize: '11.5px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  background: 'var(--bg-subtle)',
  borderBottom: '2px solid var(--border-light)',
};

const TD = {
  padding: '15px 16px',
  fontSize: '13.5px',
  color: 'var(--if-text)',
  borderBottom: '1px solid var(--border-light)',
  verticalAlign: 'middle' as const,
};

const iconBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const INITIAL_FORM = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  color: '#ff6b35',
  sort_order: '0',
};

export default function MediaCategories() {
  const toast = useToast();
  const { categories, loading, fetch, create, update, remove } = useMediaCategories();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MediaCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaCategory | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    void fetch().catch((error) => {
      toast(error instanceof Error ? error.message : '加载媒体分类失败', 'error');
    });
  }, [fetch, toast]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [categories],
  );

  function updateForm<K extends keyof typeof INITIAL_FORM>(key: K, value: (typeof INITIAL_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetEditor() {
    setEditorOpen(false);
    setEditing(null);
    setSaving(false);
    setForm(INITIAL_FORM);
  }

  function openCreate() {
    setEditing(null);
    setForm(INITIAL_FORM);
    setEditorOpen(true);
  }

  function openEdit(item: MediaCategory) {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      icon: item.icon || '',
      color: item.color || '#ff6b35',
      sort_order: String(item.sort_order ?? 0),
    });
    setEditorOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast('分类名称不能为空', 'error');
      return;
    }

    const sortOrder = Number(form.sort_order || '0');
    if (Number.isNaN(sortOrder)) {
      toast('排序值必须是数字', 'error');
      return;
    }

    const payload: CreateMediaCategoryRequest | UpdateMediaCategoryRequest = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || undefined,
      color: form.color.trim() || undefined,
      sort_order: sortOrder,
    };

    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, payload);
        toast('媒体分类已更新', 'success');
      } else {
        await create(payload as CreateMediaCategoryRequest);
        toast('媒体分类已创建', 'success');
      }
      resetEditor();
    } catch (error) {
      toast(error instanceof Error ? error.message : '保存媒体分类失败', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove(deleteTarget.id);
      toast('媒体分类已删除', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : '删除媒体分类失败', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading && categories.length === 0) {
    return <CardTableSkeleton cols={5} rows={4} />;
  }

  return (
    <>
      <PageHeader
        title="媒体分类"
        subtitle={`共 ${categories.length} 个分类，用于媒体上传筛选与素材归档`}
        actions={
          <Button onClick={openCreate}>
            <IconPlus size={14} /> 新建媒体分类
          </Button>
        }
      />

      <Card>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--if-text)' }}>媒体分类列表</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              当前分类会同步用于上传页筛选与媒体项归类。
            </div>
          </div>
          <Button variant="ghost" onClick={() => void fetch().catch((error) => {
            toast(error instanceof Error ? error.message : '刷新失败', 'error');
          })}>
            刷新列表
          </Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>名称</th>
                <th style={TH}>Slug</th>
                <th style={TH}>样式</th>
                <th style={TH}>排序</th>
                <th style={TH}>描述</th>
                <th style={{ ...TH, width: '104px', textAlign: 'right' as const }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.length > 0 ? sortedCategories.map((item) => (
                <tr key={item.id}>
                  <td style={{ ...TD, fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: item.color || 'var(--bg-subtle)',
                          color: '#fff',
                          fontSize: '12px',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon?.trim() || item.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span>{esc(item.name)}</span>
                    </div>
                  </td>
                  <td style={TD}>
                    <span style={{ background: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {esc(item.slug)}
                    </span>
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', borderRadius: '999px', background: item.color || '#d1d5db', border: '1px solid rgba(0,0,0,0.06)' }} />
                      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{esc(item.icon || '自动首字母')}</span>
                    </div>
                  </td>
                  <td style={TD}>{item.sort_order}</td>
                  <td style={{ ...TD, color: 'var(--text-secondary)' }}>{esc(item.description || '—')}</td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        title="编辑媒体分类"
                        style={{ ...iconBtn, background: 'transparent', color: '#10b981' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ecfdf5';
                          e.currentTarget.style.color = '#059669';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#10b981';
                        }}
                      >
                        <IconEdit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        title="删除媒体分类"
                        style={{ ...iconBtn, background: 'transparent', color: '#ef4444' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fef2f2';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                      >
                        <IconTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={<IconFolder size={28} />} message="暂无媒体分类，先创建一个用于上传页筛选" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={editorOpen}
        onClose={resetEditor}
        title={editing ? '编辑媒体分类' : '新建媒体分类'}
        actions={(
          <>
            <Button variant="ghost" onClick={resetEditor}>取消</Button>
            <Button onClick={handleSave} disabled={saving} loading={saving}>保存</Button>
          </>
        )}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <Input label="名称" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="例如：Banner / Podcast / Gallery" />
          <Input label="Slug" value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder="可选，建议使用英文短横线" />
          <Textarea label="描述" value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="可选，用于说明这个分类的用途" minRows={3} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="图标/简称" value={form.icon} onChange={(e) => updateForm('icon', e.target.value)} placeholder="可选，如 BN / POD" maxLength={4} />
            <Input label="排序值" type="number" value={form.sort_order} onChange={(e) => updateForm('sort_order', e.target.value)} placeholder="数字越小越靠前" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
            <Input label="颜色" value={form.color} onChange={(e) => updateForm('color', e.target.value)} placeholder="#ff6b35" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>预览</span>
              <span style={{ width: '40px', height: '40px', borderRadius: '10px', background: form.color || '#ff6b35', border: '1px solid var(--border-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                {(form.icon || form.name || 'M').slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="删除媒体分类"
        message={`确定要删除媒体分类「${deleteTarget?.name || ''}」吗？已绑定该分类的媒体项将失去分类。`}
        variant="danger"
        confirmText="删除"
      />
    </>
  );
}
