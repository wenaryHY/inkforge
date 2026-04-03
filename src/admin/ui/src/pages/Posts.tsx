import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { esc } from '../lib/utils';
import type { Post, Category, Tag } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatsCard } from '../components/StatsCard';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
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

export default function Posts() {
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [commentTotal, setCommentTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
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

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const r = await api('/api/admin/posts?page=' + p + '&size=10');
      if (r.code === 0) {
        const d = r.data as { items: Post[]; total: number; pages: number };
        setPosts(d.items || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(page); }, [page, fetchPosts]);

  useEffect(() => {
    api('/api/admin/comments?size=1').then((r) => {
      if (r.code === 0) setCommentTotal((r.data as { total: number }).total || 0);
    });
  }, []);

  function openEditor(post?: Post) {
    setEditingPost(post || null);
    setTitle(post?.title || '');
    setContent(post?.content || '');
    setExcerpt(post?.excerpt || '');
    setStatus(post?.status || 'draft');
    setCategoryId(post?.category_id || '');
    setEditorOpen(true);
    api('/api/categories').then((r) => { if (r.code === 0) setCategories(r.data as Category[] || []); });
    api('/api/tags').then((r) => { if (r.code === 0) setTags(r.data as Tag[] || []); });
    if (post?.tags) setSelectedTagIds(post.tags.map(t => t.id));
    else setSelectedTagIds([]);
  }

  async function handleSave() {
    if (!title.trim()) { toast('标题不能为空', 'error'); return; }
    setSaving(true);
    try {
      const body = { title: title.trim(), content, excerpt, status, category_id: categoryId || null, tag_ids: selectedTagIds, allow_comment: true };
      let r;
      if (editingPost?.id) {
        r = await api('/api/post/update?id=' + editingPost.id, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        r = await api('/api/posts', { method: 'POST', body: JSON.stringify(body) });
      }
      if (r && r.code === 0) {
        toast('保存成功', 'success'); setEditorOpen(false); setPage(1); fetchPosts(1);
      } else { toast(r?.message || '保存失败', 'error'); }
    } catch { toast('网络错误', 'error'); }
    setSaving(false);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const r = await api('/api/post/delete?id=' + deleteTarget.id, { method: 'DELETE' });
    if (r && r.code === 0) { toast('删除成功', 'success'); fetchPosts(page); }
    else { toast(r?.message || '删除失败', 'error'); }
    setDeleteTarget(null);
  }

  function toggleTag(id: string) {
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }

  if (loading && posts.length === 0) return <PostsSkeleton />;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={<IconFileText size={20} />} value={total} label="文章总数" theme="indigo" />
        <StatsCard icon={<IconCheckCircle size={20} />} value={posts.filter(p => p.status === 'published').length} label="已发布" theme="emerald" />
        <StatsCard icon={<IconEdit size={20} />} value={posts.filter(p => p.status === 'draft').length} label="草稿" theme="amber" />
        <StatsCard icon={<IconMessageSquare size={20} />} value={commentTotal} label="评论总数" theme="blue" />
      </div>

      <PageHeader title="文章管理" subtitle={`共 ${total} 篇文章`}
        actions={<Button onClick={() => openEditor()}><IconPlus /> 新建文章</Button>} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="th-cell">标题</th>
                <th className="th-cell">分类</th>
                <th className="th-cell">状态</th>
                <th className="th-cell">浏览量</th>
                <th className="th-cell">发布时间</th>
                <th className="th-cell">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.length ? posts.map(p => (
                <tr key={p.id} className="table-row-hover">
                  <td className="td-cell">
                    <a href={`/post?slug=${p.slug}`} target="_blank" title={p.title}
                      className="font-medium text-text-main max-w-[240px] block overflow-hidden text-ellipsis whitespace-nowrap hover:text-primary no-underline">
                      {esc(p.title)}
                    </a>
                  </td>
                  <td className="td-cell text-text-secondary text-sm">{p.category?.name || '—'}</td>
                  <td className="td-cell"><StatusBadge status={p.status} /></td>
                  <td className="td-cell text-text-muted text-sm">{p.views || 0}</td>
                  <td className="td-cell text-text-muted text-sm whitespace-nowrap">{p.published_at?.slice(0,10) || '—'}</td>
                  <td className="td-cell">
                    <div className="flex gap-1.5 items-center">
                      <a href={`/post?slug=${p.slug}`} target="_blank" title="查看文章"
                        className="inline-flex items-center gap-1 no-underline text-text-muted cursor-pointer transition-all duration-150 px-2 py-1 rounded-md hover:bg-bg-secondary hover:text-info text-xs">
                        <IconEye /> 查看
                      </a>
                      <Button size="sm" variant="ghost" onClick={() => openEditor(p)}><IconPencil /></Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget({ id: p.id, title: p.title })}><IconTrash2 /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6}><EmptyState icon={<IconFileText size={28} />} message="暂无文章" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="删除文章" message={`确定要删除「${deleteTarget?.title}」吗？此操作不可撤销。`} confirmText="确认删除" variant="danger" />

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)}
        title={editingPost ? '编辑文章' : '新建文章'}
        width="90%"
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving} loading={saving}>保存</Button>
          </>
        }>
        <div className="grid grid-cols-[1fr_280px] gap-6">
          <div className="flex flex-col gap-4">
            <Input label="标题" placeholder="输入文章标题..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea label="内容" placeholder="支持 Markdown 语法..." minRows={14} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-sm leading-relaxed" />
            <Textarea label="摘要（选填）" placeholder="简短描述文章内容..." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} minRows={2} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">发布设置</div>
              <Select label="状态" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}>
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </Select>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">分类</div>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— 无分类 —</option>
                {categories.map(c => (<option key={c.id} value={c.id}>{esc(c.name)}</option>))}
              </Select>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">标签</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.length ? tags.map(t => (
                  <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                    className={`border px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150
                      ${selectedTagIds.includes(t.id)
                        ? 'bg-primary-50 text-primary border-primary/50'
                        : 'bg-white border-border text-text-secondary hover:border-primary/40 hover:text-primary'}`}>
                    {esc(t.name)}
                  </button>
                )) : <span className="text-text-muted text-xs">暂无标签</span>}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
