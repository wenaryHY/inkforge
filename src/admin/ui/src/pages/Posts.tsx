import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiData, API, paginationPages } from '../lib/api';
import { esc } from '../lib/utils';
import type { AdminPost, Category, PaginatedResponse, Tag } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatsCard } from '../components/StatsCard';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { PostsSkeleton } from '../components/Skeleton';
import { MarkdownEditor } from '../components/MarkdownEditor';
import {
  IconFileText, IconCheckCircle, IconEdit, IconMessageSquare,
  IconPlus, IconPencil, IconEye, IconTrash2, IconCheck
} from '../components/Icons';
import { useToast } from '../contexts/ToastContext';
import { useI18n } from '../i18n';

interface DeleteTarget { id: string; title: string; }

/* ═════════════ 样式常量 ═════════════ */
const T = {
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px', fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    background: 'var(--bg-subtle)',
    borderBottom: '1px solid var(--border-light)',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-light)',
    verticalAlign: 'middle',
  },
  catBadge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '4px 10px', borderRadius: 'var(--radius-sm)',
    fontSize: '12px', fontWeight: 600,
    background: 'var(--bg-subtle)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-light)',
    whiteSpace: 'nowrap',
  },
  // 图标按钮样式
  iconBtn: (color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '32px', height: '32px',
    borderRadius: '8px',
    color: color,
    cursor: 'pointer', border: 'none', background: 'transparent',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  }),
};

/* ═════════════ 工具函数 ═════════════ */
function formatDate(dateStr: string | null | undefined): string {
  return dateStr?.slice(0, 10) || '—';
}

function PostEmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div style={{ padding: '64px 16px', textAlign: 'center' }}>
      <div style={{
        width: '72px', height: '72px', margin: '0 auto 18px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, #fff7f2, #ffeae0)',
        border: '1px solid #ffdcc8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconFileText size={30} style={{ color: '#ffb08a' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--if-text)', marginBottom: '6px' }}>{t('noPosts')}</h3>
      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '240px', margin: '0 auto', lineHeight: 1.65 }}>
        {t('noPostsHint')}
      </p>
    </div>
  );
}

/* ═════════════ 主组件 ═════════════ */
export default function Posts() {
  const { t, format } = useI18n();
  const toast = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // 批量操作状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteTarget, setBatchDeleteTarget] = useState(false);

  const publishedCount = useMemo(() => posts.filter((p) => p.status === 'published').length, [posts]);
  const draftCount = useMemo(() => posts.filter((p) => p.status === 'draft').length, [posts]);

  const fetchPosts = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const payload = await apiData<PaginatedResponse<AdminPost>>(`/api/admin/posts?page=${nextPage}&page_size=10`);
      setPosts(payload.items || []);
      setTotal(payload.pagination.total || 0);
      setPages(paginationPages(payload));
    } catch (error) {
      toast(error instanceof Error ? error.message : t('loadPostsFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMeta = useCallback(async () => {
    try {
      const [categoryData, tagData, commentData] = await Promise.all([
        apiData<Category[]>('/api/categories'),
        apiData<Tag[]>('/api/tags'),
        apiData<PaginatedResponse<unknown>>('/api/admin/comments?page=1&page_size=1'),
      ]);
      setCategories(categoryData || []);
      setTags(tagData || []);
      setCommentTotal(commentData.pagination.total || 0);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('loadMetaFailed'), 'error');
    }
  }, [toast]);

  useEffect(() => { void fetchPosts(page); }, [page, fetchPosts]);
  useEffect(() => { void fetchMeta(); }, [fetchMeta]);

  // 选中状态变化时清空批量选择
  useEffect(() => { setSelectedIds(new Set()); }, [page]);

  function openEditor(post?: AdminPost) {
    setEditingPost(post || null);
    setTitle(post?.title || '');
    setContent(post?.content_md || '');
    setExcerpt(post?.excerpt || '');
    setStatus(post?.status === 'published' ? 'published' : 'draft');
    setCategoryId(post?.category_id || '');
    setSelectedTagIds(post?.tags?.map((tag) => tag.id) || []);
    setEditorOpen(true);
  }

  async function handleSave() {
    if (!title.trim()) { toast(t('titleRequired'), 'error'); return; }
    setSaving(true);
    try {
      const body = {
        title: title.trim(), excerpt: excerpt.trim() || null,
        content_md: content, status, visibility: 'public',
        category_id: categoryId || null, tag_ids: selectedTagIds,
        allow_comment: true, pinned: false,
      };
      if (editingPost?.id) {
        await apiData(`/api/admin/posts/${editingPost.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await apiData('/api/admin/posts', { method: 'POST', body: JSON.stringify(body) });
      }
      toast(t('saveSuccess'), 'success');
      setEditorOpen(false);
      setPage(1);
      await fetchPosts(1);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiData(`/api/admin/posts/${deleteTarget.id}`, { method: 'DELETE' });
      toast(t('deleteSuccess'), 'success');
      await fetchPosts(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('deleteFailed'), 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  // 批量删除
  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    setBatchDeleteTarget(true);
  }

  async function confirmBatchDelete() {
    try {
      await Promise.all(
        [...selectedIds].map(id =>
          apiData(`/api/admin/posts/${id}`, { method: 'DELETE' })
        )
      );
      toast(format('batchDeletePostsSuccess', { count: selectedIds.size }), 'success');
      setSelectedIds(new Set());
      await fetchPosts(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('batchDeletePostsFailed'), 'error');
    } finally {
      setBatchDeleteTarget(false);
    }
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }

  // 全选/取消全选
  function toggleSelectAll() {
    if (selectedIds.size === posts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map(p => p.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading && posts.length === 0) return <PostsSkeleton />;

  return (
    <>
      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatsCard icon={<IconFileText size={20} />} value={total} label={t('postsTotal')} theme="orange" />
        <StatsCard icon={<IconCheckCircle size={20} />} value={publishedCount} label={t('publishedCount')} theme="emerald" />
        <StatsCard icon={<IconEdit size={20} />} value={draftCount} label={t('draftCount')} theme="amber" />
        <StatsCard icon={<IconMessageSquare size={20} />} value={commentTotal} label={t('commentsTotal')} theme="blue" />
      </div>

      <PageHeader
        title={t('postsTitle')}
        subtitle={format('postsCount', { count: total })}
        actions={<Button onClick={() => openEditor()}><IconPlus /> {t('newPost')}</Button>}
      />

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-light)', marginBottom: '20px' }}>
        <button
          style={{
            padding: '10px 4px', fontSize: '14px', fontWeight: 600, color: 'var(--primary-600)',
            borderBottom: '2px solid var(--primary-500)', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'
          }}
        >
          {t('activePosts')}
        </button>
        <button
          onClick={() => navigate('/trash?tab=post')}
          style={{
            padding: '10px 4px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)',
            borderBottom: '2px solid transparent', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {t('deletedItems')}
        </button>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        {/* 批量操作栏 */}
        {selectedIds.size > 0 && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--primary-50)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'slideDown 0.2s ease',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-600)' }}>
              {format('selectedCount', { count: selectedIds.size })}
            </span>
            <Button size="sm" variant="danger" onClick={handleBatchDelete}>
              <IconTrash2 size={14} /> {t('batchDelete')}
            </Button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...T.th, width: '44px', textAlign: 'center' as const }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      width: '18px', height: '18px',
                      borderRadius: '4px',
                      border: `1.5px solid ${selectedIds.size === posts.length && posts.length > 0 ? 'var(--primary-500)' : 'var(--border-default)'}`,
                      background: selectedIds.size === posts.length && posts.length > 0 ? 'var(--primary-500)' : 'transparent',
                      cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {selectedIds.size === posts.length && posts.length > 0 && (
                      <IconCheck size={12} color="#fff" />
                    )}
                  </button>
                </th>
                <th style={{ ...T.th }}>{t('titleLabel')}</th>
                <th style={{ ...T.th, width: '100px' }}>{t('categoryLabel')}</th>
                <th style={{ ...T.th, width: '88px' }}>{t('statusLabel')}</th>
                <th style={{ ...T.th, width: '110px' }}>{t('publishTimeLabel')}</th>
                <th style={{ ...T.th, width: '120px', textAlign: 'right' as const }}>{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? posts.map((post) => {
                const category = categories.find((item) => item.id === post.category_id);
                const isSelected = selectedIds.has(post.id);
                return (
                  <tr key={post.id}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--primary-50)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    style={{
                      transition: 'background 0.12s ease',
                      background: isSelected ? 'var(--primary-50)' : 'transparent',
                    }}
                  >
                    {/* Checkbox 列 */}
                    <td style={{ ...T.td, textAlign: 'center' }}>
                      <button
                        onClick={() => toggleSelect(post.id)}
                        style={{
                          width: '18px', height: '18px',
                          borderRadius: '4px',
                          border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-default)'}`,
                          background: isSelected ? 'var(--primary-500)' : 'transparent',
                          cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected && <IconCheck size={12} color="#fff" />}
                      </button>
                    </td>
                    {/* 标题 */}
                    <td style={{ ...T.td }}>
                      <button
                        onClick={() => openEditor(post)}
                        title={post.title}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '7px',
                          fontSize: '14px', fontWeight: 600, color: 'var(--if-text)',
                          maxWidth: '280px', textDecoration: 'none',
                          overflow: 'hidden', background: 'none', border: 'none',
                          cursor: 'pointer', padding: 0,
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{esc(post.title)}</span>
                      </button>
                    </td>
                    {/* 分类 */}
                    <td style={{ ...T.td }}>
                      <span style={T.catBadge}>{category?.name || t('uncategorized')}</span>
                    </td>
                    {/* 状态 */}
                    <td style={{ ...T.td }}><StatusBadge status={post.status} /></td>
                    {/* 时间 */}
                    <td style={{ ...T.td, fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {formatDate(post.published_at)}
                    </td>
                    {/* 操作列 - 图标按钮始终可见 */}
                    <td style={{ ...T.td }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', alignItems: 'center' }}>
                        {/* 查看 */}
                        <button type="button"
                          title={t('viewOnHomepage')}
                          style={T.iconBtn('#10b981')}
                          onClick={() => window.open(`${API}/posts/${post.slug}`, '_blank')}
                          onMouseEnter={e => { e.currentTarget.style.background = '#d1fae5'; e.currentTarget.style.color = '#059669'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
                        ><IconEye size={16} /></button>
                        {/* 编辑 */}
                        <button type="button"
                          title={t('editPost')}
                          style={T.iconBtn('#3b82f6')}
                          onClick={() => openEditor(post)}
                          onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3b82f6'; }}
                        ><IconPencil size={16} /></button>
                        {/* 删除 */}
                        <button type="button"
                          title={t('deletePost')}
                          style={T.iconBtn('#ef4444')}
                          onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                        ><IconTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : null}
            </tbody>
          </table>
        </div>

        {posts.length === 0 ? (
          <PostEmptyState t={t} />
        ) : (
          <div style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              第 {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} 条，共 {total} 条
            </span>
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {/* 单个删除确认 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="删除文章"
        message={`确定要删除文章「${deleteTarget?.title || ''}」吗？此操作不可恢复。`}
        confirmText="确认删除" variant="danger"
      />

      {/* 批量删除确认 */}
      <ConfirmDialog
        open={batchDeleteTarget}
        onClose={() => setBatchDeleteTarget(false)}
        onConfirm={confirmBatchDelete}
        title="批量删除文章"
        message={`确定要删除选中的 ${selectedIds.size} 篇文章吗？此操作不可恢复。`}
        confirmText={`删除 ${selectedIds.size} 篇`} variant="danger"
      />

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingPost ? t('editPostTitle') : t('createPostTitle')}
        width="90%"
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSave} disabled={saving} loading={saving}>{t('save')}</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input label={t('titleLabel')} placeholder={t('titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('postContentLabel')}</div>
              <div style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
                <MarkdownEditor value={content} onChange={setContent} />
              </div>
            </div>
            <Input label={t('excerptLabel')} placeholder={t('excerptPlaceholder')} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{
              background: 'linear-gradient(180deg, rgba(240,241,243,0.9), #f0f1f3)',
              borderRadius: '14px', padding: '20px',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{
                fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: '16px',
                paddingBottom: '12px', borderBottom: '1px solid var(--border-light)',
              }}>{t('publishSettings')}</div>
              <Select label={t('statusLabel')} value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}>
                <option value="draft">{t('draftOption')}</option>
                <option value="published">{t('publishedOption')}</option>
              </Select>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(240,241,243,0.9), #f0f1f3)',
              borderRadius: '14px', padding: '20px',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{
                fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: '16px',
                paddingBottom: '12px', borderBottom: '1px solid var(--border-light)',
              }}>{t('categoryAndTags')}</div>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">{t('noCategory')}</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{esc(cat.name)}</option>))}
              </Select>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '14px' }}>
                {tags.length > 0 ? tags.map((tag) => (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} style={{
                    border: selectedTagIds.includes(tag.id)
                      ? `1.5px solid var(--primary-500)`
                      : '1.5px solid var(--border-default)',
                    padding: '6px 14px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    background: selectedTagIds.includes(tag.id) ? 'var(--primary-500)' : 'var(--bg-card)',
                    color: selectedTagIds.includes(tag.id) ? '#fff' : 'var(--text-secondary)',
                    boxShadow: selectedTagIds.includes(tag.id) ? '0 2px 10px rgba(255,107,53,0.25)' : undefined,
                    transition: 'all 0.18s ease',
                  }}>{esc(tag.name)}</button>
                )) : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('noTagsAvailable')}</span>}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
