import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiData, paginationPages } from '../lib/api';
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
import { Textarea } from '../components/Textarea';
import { Select } from '../components/Select';
import { PostsSkeleton } from '../components/Skeleton';
import {
  IconFileText, IconCheckCircle, IconEdit, IconMessageSquare,
  IconPlus, IconPencil, IconEye, IconTrash2,
} from '../components/Icons';
import { useToast } from '../contexts/ToastContext';

interface DeleteTarget { id: string; title: string; }

/* ═════════════ 样式常量 ═════════════ */
const T = {
  th: {
    padding: '14px 20px',
    textAlign: 'left' as const,
    fontSize: '11.5px', fontWeight: 700,
    color: 'var(--if-text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    background: 'var(--if-bg-secondary)',
    borderBottom: '2px solid var(--if-border-light)',
  },
  td: {
    padding: '15px 20px',
    fontSize: '13.5px',
    color: 'var(--if-text)',
    borderBottom: '1px solid var(--if-border-light)',
    verticalAlign: 'middle',
  },
  rowHover: (e: React.MouseEvent<HTMLTableRowElement>) => { e.currentTarget.style.background = 'var(--if-primary-50)'; },
  rowLeave: (e: React.MouseEvent<HTMLTableRowElement>) => { e.currentTarget.style.background = 'transparent'; },
  catBadge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '4px 10px', borderRadius: '8px',
    fontSize: '12px', fontWeight: 600,
    background: 'var(--if-bg-secondary)',
    color: 'var(--if-text-secondary)',
    border: '1px solid var(--if-border-light)',
  },
  actionBtn: (color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '5px 10px',
    borderRadius: '8px',
    fontSize: '12px', fontWeight: 500,
    color: color,
    cursor: 'pointer', border: 'none', background: 'transparent',
    transition: 'all 0.15s ease',
  }),
};

function PostEmptyState() {
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
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--if-text)', marginBottom: '6px' }}>暂无文章</h3>
      <p style={{ fontSize: '13.5px', color: 'var(--if-text-muted)', maxWidth: '240px', margin: '0 auto', lineHeight: 1.65 }}>
        点击右上角「新建文章」开始你的第一篇内容吧
      </p>
    </div>
  );
}

export default function Posts() {
  const toast = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
      toast(error instanceof Error ? error.message : '加载数据失败', 'error');
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
      toast(error instanceof Error ? error.message : '加载元数据失败', 'error');
    }
  }, [toast]);

  useEffect(() => { void fetchPosts(page); }, [page, fetchPosts]);
  useEffect(() => { void fetchMeta(); }, [fetchMeta]);

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
    if (!title.trim()) { toast('标题不能为空', 'error'); return; }
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
      toast('保存成功', 'success');
      setEditorOpen(false);
      setPage(1);
      await fetchPosts(1);
    } catch (error) {
      toast(error instanceof Error ? error.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiData(`/api/admin/posts/${deleteTarget.id}`, { method: 'DELETE' });
      toast('删除成功', 'success');
      await fetchPosts(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : '删除失败', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }

  if (loading && posts.length === 0) return <PostsSkeleton />;

  return (
    <>
      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatsCard icon={<IconFileText size={20} />} value={total} label="文章总数" theme="orange" />
        <StatsCard icon={<IconCheckCircle size={20} />} value={publishedCount} label="已发布" theme="emerald" />
        <StatsCard icon={<IconEdit size={20} />} value={draftCount} label="草稿" theme="amber" />
        <StatsCard icon={<IconMessageSquare size={20} />} value={commentTotal} label="评论总数" theme="blue" />
      </div>

      <PageHeader
        title="文章管理"
        subtitle={`共 ${total} 篇文章`}
        actions={<Button onClick={() => openEditor()}><IconPlus /> 新建文章</Button>}
      />

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...T.th }}>标题</th>
                <th style={{ ...T.th, width: '110px' }}>分类</th>
                <th style={{ ...T.th, width: '90px' }}>状态</th>
                <th style={{ ...T.th, width: '120px' }}>发布时间</th>
                <th style={{ ...T.th, width: '150px', textAlign: 'right' as const }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? posts.map((post) => {
                const category = categories.find((item) => item.id === post.category_id);
                return (
                  <tr key={post.id}
                    onMouseEnter={T.rowHover}
                    onMouseLeave={T.rowLeave}
                    style={{ transition: 'background 0.12s ease' }}
                  >
                    <td style={{ ...T.td }}>
                      <a href={`/posts/${post.slug}`} target="_blank" rel="noreferrer"
                        title={post.title}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '7px',
                          fontSize: '14px', fontWeight: 600, color: 'var(--if-text)',
                          maxWidth: '260px', textDecoration: 'none',
                          overflow: 'hidden',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{esc(post.title)}</span>
                      </a>
                    </td>
                    <td style={{ ...T.td }}>
                      <span style={T.catBadge}>{category?.name || '未分类'}</span>
                    </td>
                    <td style={{ ...T.td }}><StatusBadge status={post.status} /></td>
                    <td style={{ ...T.td, fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--if-text-muted)' }}>
                      {post.published_at?.slice(0, 10) || '未发布'}
                    </td>
                    <td style={{ ...T.td }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '3px', opacity: 0, transition: 'opacity 0.15s ease' }}
                         onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                         onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                      >
                        <a href={`/posts/${post.slug}`} target="_blank" rel="noreferrer" title="查看"
                           style={{ ...T.actionBtn('#3b82f6'), textDecoration: 'none' }}
                           onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                           onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        ><IconEye size={14} /> 查看</a>
                        <button type="button" onClick={() => openEditor(post)} title="编辑"
                          style={{ ...T.actionBtn('#10b981') }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ecfdf5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        ><IconPencil size={14} /> 编辑</button>
                        <button type="button" onClick={() => setDeleteTarget({ id: post.id, title: post.title })} title="删除"
                          style={{ ...T.actionBtn('#ef4444') }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        ><IconTrash2 size={14} /> 删除</button>
                      </div>
                    </td>
                  </tr>
                );
              }) : null}
            </tbody>
          </table>
        </div>

        {posts.length === 0 ? (
          <PostEmptyState />
        ) : (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--if-border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '12.5px', color: 'var(--if-text-muted)' }}>
              第 {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} 条，共 {total} 条
            </span>
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="删除文章"
        message={`确定要删除文章「${deleteTarget?.title || ''}」吗？此操作不可恢复。`}
        confirmText="确认删除" variant="danger"
      />

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingPost ? '编辑文章' : '新建文章'}
        width="90%"
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving} loading={saving}>保存</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <Input label="标题" placeholder="请输入文章标题..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea label="正文" placeholder="支持 Markdown ..." minRows={14} value={content} onChange={(e) => setContent(e.target.value)} style={{ fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: '13.5px', lineHeight: 1.75 }} />
            <Textarea label="摘要" placeholder="文章摘要，可选填..." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} minRows={2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{
              background: 'linear-gradient(180deg, rgba(240,241,243,0.9), #f0f1f3)',
              borderRadius: '14px', padding: '20px',
              border: '1px solid var(--if-border-light)',
            }}>
              <div style={{
                fontSize: '11.5px', fontWeight: 800, color: 'var(--if-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: '16px',
                paddingBottom: '12px', borderBottom: '1px solid var(--if-border-light)',
              }}>发布设置</div>
              <Select label="状态" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </Select>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(240,241,243,0.9), #f0f1f3)',
              borderRadius: '14px', padding: '20px',
              border: '1px solid var(--if-border-light)',
            }}>
              <div style={{
                fontSize: '11.5px', fontWeight: 800, color: 'var(--if-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: '16px',
                paddingBottom: '12px', borderBottom: '1px solid var(--if-border-light)',
              }}>分类与标签</div>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">无分类</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{esc(cat.name)}</option>))}
              </Select>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '14px' }}>
                {tags.length > 0 ? tags.map((tag) => (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} style={{
                    border: selectedTagIds.includes(tag.id)
                      ? `1.5px solid var(--if-primary)`
                      : '1.5px solid var(--if-border)',
                    padding: '6px 14px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    background: selectedTagIds.includes(tag.id) ? 'var(--if-primary)' : 'var(--if-bg-card)',
                    color: selectedTagIds.includes(tag.id) ? '#fff' : 'var(--if-text-secondary)',
                    boxShadow: selectedTagIds.includes(tag.id) ? '0 2px 10px rgba(255,107,53,0.25)' : undefined,
                    transition: 'all 0.18s ease',
                  }}>{esc(tag.name)}</button>
                )) : <span style={{ fontSize: '12px', color: 'var(--if-text-muted)' }}>暂无标签</span>}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
