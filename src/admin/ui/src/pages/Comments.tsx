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

const TH = {
  padding: '14px 18px', textAlign: 'left' as const, fontSize: '11.5px',
  fontWeight: 700, color: 'var(--if-text-muted)', textTransform: 'uppercase' as const,
  letterSpacing: '0.06em', background: 'var(--if-bg-secondary)',
  borderBottom: '2px solid var(--if-border-light)',
};
const TD = {
  padding: '14px 18px', fontSize: '13px', color: 'var(--if-text)',
  borderBottom: '1px solid var(--if-border-light)', verticalAlign: 'middle',
};

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
      setItems(payload.items || []); setTotal(payload.pagination.total || 0); setPages(paginationPages(payload));
    } catch (error) { toast(error instanceof Error ? error.message : '加载评论失败', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { void fetchComments(page); }, [page, fetchComments]);

  async function handleApprove(id: string) {
    try { await apiData(`/api/admin/comments/${id}/approve`, { method: 'POST' }); toast('已通过', 'success'); await fetchComments(page); }
    catch (error) { toast(error instanceof Error ? error.message : '操作失败', 'error'); }
  }

  async function handleReject(id: string) {
    try { await apiData(`/api/admin/comments/${id}/reject`, { method: 'POST' }); toast('已拒绝', 'success'); await fetchComments(page); }
    catch (error) { toast(error instanceof Error ? error.message : '操作失败', 'error'); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try { await apiData(`/api/admin/comments/${deleteTarget.id}`, { method: 'DELETE' }); toast('删除成功', 'success'); await fetchComments(page); }
    catch (error) { toast(error instanceof Error ? error.message : '删除失败', 'error'); }
    finally { setDeleteTarget(null); }
  }

  const pendingCount = useMemo(() => items.filter((i) => i.status === 'pending').length, [items]);

  if (loading && items.length === 0) return <PostsSkeleton />;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <StatsCard icon={<IconMessageSquare size={20} />} value={total} label="评论总数" theme="blue" />
        <StatsCard icon={<IconClock size={20} />} value={pendingCount} label="待审核" theme="amber" />
      </div>

      <PageHeader title="评论管理" subtitle={`共 ${total} 条评论`} />

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={TH}>用户</th><th style={TH}>内容</th><th style={TH}>文章</th>
              <th style={TH}>状态</th><th style={TH}>时间</th><th style={TH}>操作</th>
            </tr></thead>
            <tbody>
              {items.length > 0 ? items.map((cmt) => (
                <tr key={cmt.id}
                  onMouseEnter={e => e.currentTarget.style.background = cmt.status === 'pending' ? '#fffbeb' : 'var(--if-primary-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.12s ease' }}
                >
                  <td style={{ ...TD, width: '130px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600 }}>{esc(cmt.display_name)}</span>
                      <span style={{ fontSize: '12px', color: 'var(--if-text-muted)' }}>@{esc(cmt.username)}</span>
                    </div>
                  </td>
                  <td style={{ ...TD, maxWidth: '260px', color: 'var(--if-text-secondary)' }}>
                    <span style={{
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden', lineHeight: 1.55,
                    }}>{esc(cmt.content)}</span>
                  </td>
                  <td style={{ ...TD, maxWidth: '180px' }}>
                    {cmt.post_title ? (
                      <a href={`/posts/${cmt.post_slug || ''}`} target="_blank" rel="noreferrer"
                        title={cmt.post_title} style={{
                          fontSize: '12px', color: 'var(--if-primary)', textDecoration: 'none',
                          display: 'inline-flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      ><IconExternalLink size={11} />{esc(cmt.post_title)}</a>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--if-text-muted)', textDecoration: 'line-through' }}>文章已删除</span>
                    )}
                  </td>
                  <td style={TD}><StatusBadge status={cmt.status} /></td>
                  <td style={{ ...TD, fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--if-text-muted)' }}>
                    {cmt.created_at?.slice(0, 16).replace('T', ' ') || '—'}
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      {cmt.status === 'pending' && (
                        <>
                          <Button size="sm" variant="success" onClick={() => handleApprove(cmt.id)}><IconCheckCircle size={13} /> 通过</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleReject(cmt.id)}>拒绝</Button>
                        </>
                      )}
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(cmt)}><IconTrash2 size={13} /></Button>
                    </div>
                  </td>
                </tr>
              )) : (<tr><td colSpan={6}><EmptyState icon={<IconMessageSquare size={28} />} message="暂无评论" /></td></tr>)}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="删除评论" message={`确定要删除 ${deleteTarget?.display_name || ''} 的评论吗？`} variant="danger" />
    </>
  );
}
