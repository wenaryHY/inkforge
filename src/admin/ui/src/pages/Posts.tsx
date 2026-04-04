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
      toast(error instanceof Error ? error.message : '��������ʧ��', 'error');
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
      toast(error instanceof Error ? error.message : '����Ԫ����ʧ��', 'error');
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
    if (!title.trim()) {
      toast('���ⲻ��Ϊ��', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content_md: content,
        status,
        visibility: 'public',
        category_id: categoryId || null,
        tag_ids: selectedTagIds,
        allow_comment: true,
        pinned: false,
      };

      if (editingPost?.id) {
        await apiData(`/api/admin/posts/${editingPost.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        await apiData('/api/admin/posts', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      toast('����ɹ�', 'success');
      setEditorOpen(false);
      setPage(1);
      await fetchPosts(1);
    } catch (error) {
      toast(error instanceof Error ? error.message : '����ʧ��', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiData(`/api/admin/posts/${deleteTarget.id}`, { method: 'DELETE' });
      toast('ɾ���ɹ�', 'success');
      await fetchPosts(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'ɾ��ʧ��', 'error');
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon={<IconFileText size={20} />} value={total} label="��������" theme="indigo" />
        <StatsCard icon={<IconCheckCircle size={20} />} value={publishedCount} label="�ѷ���" theme="emerald" />
        <StatsCard icon={<IconEdit size={20} />} value={draftCount} label="�ݸ�" theme="amber" />
        <StatsCard icon={<IconMessageSquare size={20} />} value={commentTotal} label="��������" theme="blue" />
      </div>

      <PageHeader
        title="���¹���"
        subtitle={`�� ${total} ƪ����`}
        actions={<Button onClick={() => openEditor()}><IconPlus /> �½�����</Button>}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="th-cell">����</th>
                <th className="th-cell">����</th>
                <th className="th-cell">״̬</th>
                <th className="th-cell">����ʱ��</th>
                <th className="th-cell">����</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? posts.map((post) => {
                const category = categories.find((item) => item.id === post.category_id);
                return (
                  <tr key={post.id} className="table-row-hover">
                    <td className="td-cell">
                      <a
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title={post.title}
                        className="font-medium text-text-main max-w-[240px] block overflow-hidden text-ellipsis whitespace-nowrap hover:text-primary no-underline"
                      >
                        {esc(post.title)}
                      </a>
                    </td>
                    <td className="td-cell text-text-secondary text-sm">{category?.name || 'δ����'}</td>
                    <td className="td-cell"><StatusBadge status={post.status} /></td>
                    <td className="td-cell text-text-muted text-sm whitespace-nowrap">{post.published_at?.slice(0, 10) || 'δ����'}</td>
                    <td className="td-cell">
                      <div className="flex gap-1.5 items-center">
                        <a href={`/posts/${post.slug}`} target="_blank" rel="noreferrer" title="�鿴����" className="inline-flex items-center gap-1 no-underline text-text-muted cursor-pointer transition-all duration-150 px-2 py-1 rounded-md hover:bg-bg-secondary hover:text-info text-xs">
                          <IconEye /> �鿴
                        </a>
                        <Button size="sm" variant="ghost" onClick={() => openEditor(post)}><IconPencil /></Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget({ id: post.id, title: post.title })}><IconTrash2 /></Button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5}><EmptyState icon={<IconFileText size={28} />} message="��������" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="ɾ������"
        message={`ȷ��Ҫɾ����${deleteTarget?.title || ''}���𣿴˲������ɳ�����`}
        confirmText="ȷ��ɾ��"
        variant="danger"
      />

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingPost ? '�༭����' : '�½�����'}
        width="90%"
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>ȡ��</Button>
            <Button onClick={handleSave} disabled={saving} loading={saving}>����</Button>
          </>
        }
      >
        <div className="grid grid-cols-[1fr_280px] gap-6">
          <div className="flex flex-col gap-4">
            <Input label="����" placeholder="�������±���..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea label="����" placeholder="֧�� Markdown ..." minRows={14} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-sm leading-relaxed" />
            <Textarea label="ժҪ" placeholder="��Ҫ������������..." value={excerpt} onChange={(e) => setExcerpt(e.target.value)} minRows={2} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">��������</div>
              <Select label="״̬" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}>
                <option value="draft">�ݸ�</option>
                <option value="published">�ѷ���</option>
              </Select>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">����</div>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">�޷���</option>
                {categories.map((category) => (<option key={category.id} value={category.id}>{esc(category.name)}</option>))}
              </Select>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">��ǩ</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.length > 0 ? tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`border px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 ${selectedTagIds.includes(tag.id) ? 'bg-primary-50 text-primary border-primary/50' : 'bg-white border-border text-text-secondary hover:border-primary/40 hover:text-primary'}`}
                  >
                    {esc(tag.name)}
                  </button>
                )) : <span className="text-text-muted text-xs">���ޱ�ǩ</span>}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
