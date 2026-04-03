import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { esc } from '../lib/utils';
import type { Comment } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatsCard } from '../components/StatsCard';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PostsSkeleton } from '../components/Skeleton';
import {
  IconMessageSquare, IconClock, IconCheckCircle, IconTrash2, IconExternalLink,
} from '../components/Icons';
import { useToast } from '../contexts/ToastContext';

interface CommentsProps { refreshTrigger?: number; }

export default function Comments({ refreshTrigger }: CommentsProps) {
  const toast = useToast();
  const [items, setItems] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; author: string } | null>(null);

  const fetchComments = useCallback(async (p: number) => {
    setLoading(true);
    const r = await api('/api/admin/comments?page=' + p + '&size=15');
    if (r.code === 0) {
      const d = r.data as { items: Comment[]; total: number; pages: number };
      setItems(d.items || []); setTotal(d.total || 0); setPages(d.pages || 1);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchComments(page); }, [page, fetchComments, refreshTrigger]);

  async function handleApprove(id: string) {
    try {
      const r = await api('/api/comment/approve?id=' + id, { method: 'PUT' });
      if (r && r.code === 0) { toast('审核通过', 'success'); fetchComments(page); }
      else toast(r?.message || '操作失败', 'error');
    } catch { toast('网络错误', 'error'); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const r = await api('/api/comment/delete?id=' + deleteTarget.id, { method: 'DELETE' });
      if (r && r.code === 0) { toast('删除成功', 'success'); fetchComments(page); }
      else toast(r?.message || '删除失败', 'error');
    } catch { toast('网络错误', 'error'); }
    setDeleteTarget(null);
  }

  const pendingCount = items.filter(c => c.status === 'pending').length;

  if (loading && items.length === 0) return <PostsSkeleton />;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard icon={<IconMessageSquare size={20} />} value={total} label="评论总数" theme="blue" />
        <StatsCard icon={<IconClock size={20} />} value={pendingCount} label="待审核" theme="amber" />
      </div>

      <PageHeader title="评论管理" subtitle={`共 ${total} 条评论`} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="th-cell">昵称</th>
                <th className="th-cell">评论内容</th>
                <th className="th-cell">所属文章</th>
                <th className="th-cell">状态</th>
                <th className="th-cell">时间</th>
                <th className="th-cell">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map(c => (
                <tr key={c.id} className={`${c.status === 'pending' ? 'row-pending' : ''} table-row-hover`}>
                  <td className="td-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{esc(c.author_name)}</span>
                      {c.author_email && <span className="text-xs text-text-muted">{esc(c.author_email)}</span>}
                    </div>
                  </td>
                  <td className="td-cell text-text-secondary max-w-[200px]">
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{esc(c.content)}</span>
                  </td>
                  <td className="td-cell">
                    {c.post_title
                      ? <a href={`/post?slug=${c.post_slug || ''}`} target="_blank" title={c.post_title}
                        className="text-xs text-primary max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap block hover:underline inline-flex items-center gap-1">
                        <IconExternalLink size={11} />{esc(c.post_title)}
                      </a>
                      : <span className="text-text-muted text-xs line-through">文章已删除</span>}
                  </td>
                  <td className="td-cell"><StatusBadge status={c.status} /></td>
                  <td className="td-cell text-text-muted text-xs whitespace-nowrap tabular-nums">{c.created_at?.slice(0, 16).replace('T', ' ') || '—'}</td>
                  <td className="td-cell">
                    <div className="flex gap-1.5 items-center">
                      {c.status === 'pending' && (
                        <Button size="sm" variant="success" onClick={() => handleApprove(c.id)}><IconCheckCircle size={13} /> 通过</Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget({ id: c.id, author: c.author_name })}><IconTrash2 size={13} /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6}><EmptyState icon={<IconMessageSquare size={28} />} message="暂无评论" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="删除评论" message={`确定要删除 ${deleteTarget?.author} 的这条评论吗？`} variant="danger" />
    </>
  );
}
