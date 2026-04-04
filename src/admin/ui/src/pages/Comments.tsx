import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiData, paginationPages } from '../lib/api';
import { esc } from '../lib/utils';
import type { Comment, PaginatedResponse } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatsCard } from '../components/StatsCard';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PostsSkeleton } from '../components/Skeleton';
import { IconMessageSquare, IconClock, IconCheckCircle, IconTrash2, IconExternalLink } from '../components/Icons';
import { useToast } from '../contexts/ToastContext';

export default function Comments() {
  const toast = useToast();
  const [items, setItems] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const fetchComments = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const payload = await apiData<PaginatedResponse<Comment>>(`/api/admin/comments?page=${nextPage}&page_size=15`);
      setItems(payload.items || []);
      setTotal(payload.pagination.total || 0);
      setPages(paginationPages(payload));
    } catch (error) {
      toast(error instanceof Error ? error.message : '��������ʧ��', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchComments(page); }, [page, fetchComments]);

  async function handleApprove(id: string) {
    try {
      await apiData(`/api/admin/comments/${id}/approve`, { method: 'POST' });
      toast('���ͨ��', 'success');
      await fetchComments(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : '����ʧ��', 'error');
    }
  }

  async function handleReject(id: string) {
    try {
      await apiData(`/api/admin/comments/${id}/reject`, { method: 'POST' });
      toast('�Ѿܾ�', 'success');
      await fetchComments(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : '����ʧ��', 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiData(`/api/admin/comments/${deleteTarget.id}`, { method: 'DELETE' });
      toast('ɾ���ɹ�', 'success');
      await fetchComments(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'ɾ��ʧ��', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  const pendingCount = useMemo(() => items.filter((item) => item.status === 'pending').length, [items]);

  if (loading && items.length === 0) return <PostsSkeleton />;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatsCard icon={<IconMessageSquare size={20} />} value={total} label="��������" theme="blue" />
        <StatsCard icon={<IconClock size={20} />} value={pendingCount} label="�����" theme="amber" />
      </div>

      <PageHeader title="���۹���" subtitle={`�� ${total} ������`} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="th-cell">�û�</th>
                <th className="th-cell">����</th>
                <th className="th-cell">����</th>
                <th className="th-cell">״̬</th>
                <th className="th-cell">ʱ��</th>
                <th className="th-cell">����</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? items.map((comment) => (
                <tr key={comment.id} className={`${comment.status === 'pending' ? 'row-pending' : ''} table-row-hover`}>
                  <td className="td-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{esc(comment.display_name)}</span>
                      <span className="text-xs text-text-muted">@{esc(comment.username)}</span>
                    </div>
                  </td>
                  <td className="td-cell text-text-secondary max-w-[260px]">
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{esc(comment.content)}</span>
                  </td>
                  <td className="td-cell">
                    {comment.post_title ? (
                      <a href={`/posts/${comment.post_slug || ''}`} target="_blank" rel="noreferrer" title={comment.post_title} className="text-xs text-primary max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap block hover:underline inline-flex items-center gap-1">
                        <IconExternalLink size={11} />{esc(comment.post_title)}
                      </a>
                    ) : (
                      <span className="text-text-muted text-xs line-through">���²�����</span>
                    )}
                  </td>
                  <td className="td-cell"><StatusBadge status={comment.status} /></td>
                  <td className="td-cell text-text-muted text-xs whitespace-nowrap tabular-nums">{comment.created_at?.slice(0, 16).replace('T', ' ') || '��'}</td>
                  <td className="td-cell">
                    <div className="flex gap-1.5 items-center">
                      {comment.status === 'pending' && <Button size="sm" variant="success" onClick={() => handleApprove(comment.id)}><IconCheckCircle size={13} /> ͨ��</Button>}
                      {comment.status === 'pending' && <Button size="sm" variant="ghost" onClick={() => handleReject(comment.id)}>�ܾ�</Button>}
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(comment)}><IconTrash2 size={13} /></Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6}><EmptyState icon={<IconMessageSquare size={28} />} message="��������" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="ɾ������" message={`ȷ��Ҫɾ�� ${deleteTarget?.display_name || ''} ������������`} variant="danger" />
    </>
  );
}
