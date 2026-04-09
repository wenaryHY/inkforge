import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiData, paginationPages, API_PREFIX } from '../lib/api';
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
import { IconMessageSquare, IconClock, IconCheckCircle, IconTrash2, IconExternalLink, IconCheck, IconBan } from '../components/Icons';
import { useToast } from '../contexts/ToastContext';

/* 样式 */
const TH = {
  padding: '14px 16px', textAlign: 'left' as const, fontSize: '11.5px',
  fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const,
  letterSpacing: '0.06em', background: 'var(--bg-subtle)',
  borderBottom: '2px solid var(--border-light)',
};
const TD = {
  padding: '14px 16px', fontSize: '13px', color: 'var(--if-text)',
  borderBottom: '1px solid var(--border-light)', verticalAlign: 'middle',
};
const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '32px', height: '32px', borderRadius: '8px',
  border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
};

export default function Comments() {
  const toast = useToast();
  const [items, setItems] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  // 批量选择
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  const fetchComments = useCallback(async (nextPage: number) => {
    setLoading(true);
    try {
      const payload = await apiData<PaginatedResponse<Comment>>(`${API_PREFIX}/admin/comments?page=${nextPage}&page_size=15`);
      setItems(payload.items || []); setTotal(payload.pagination.total || 0); setPages(paginationPages(payload));
    } catch (error) { toast(error instanceof Error ? error.message : '加载评论失败', 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { void fetchComments(page); }, [page, fetchComments]);
  useEffect(() => { setSelectedIds(new Set()); }, [page]);

  async function handleApprove(id: string) {
    try { await apiData(`${API_PREFIX}/admin/comments/${id}/approve`, { method: 'POST' }); toast('已通过', 'success'); await fetchComments(page); }
    catch (error) { toast(error instanceof Error ? error.message : '操作失败', 'error'); }
  }

  async function handleReject(id: string) {
    try { await apiData(`${API_PREFIX}/admin/comments/${id}/reject`, { method: 'POST' }); toast('已拒绝', 'success'); await fetchComments(page); }
    catch (error) { toast(error instanceof Error ? error.message : '操作失败', 'error'); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiData(`${API_PREFIX}/admin/comments/${deleteTarget.id}`, { method: 'DELETE' });
      toast('删除成功', 'success');
      setSelectedIds(prev => { const next = new Set(prev); next.delete(deleteTarget.id); return next; });
      await fetchComments(page);
    } catch (error) { toast(error instanceof Error ? error.message : '删除失败', 'error'); }
    finally { setDeleteTarget(null); }
  }

  // 批量操作
  async function handleBatchApprove() {
    const pendingIds = [...selectedIds].filter(id => {
      const c = items.find(i => i.id === id);
      return c && c.status === 'pending';
    });
    if (pendingIds.length === 0) { toast('没有待审核的评论', 'info'); return; }
    try {
      await Promise.all(pendingIds.map(id => apiData(`${API_PREFIX}/admin/comments/${id}/approve`, { method: 'POST' })));
      toast(`成功通过 ${pendingIds.length} 条评论`, 'success');
      setSelectedIds(new Set());
      await fetchComments(page);
    } catch (error) { toast(error instanceof Error ? error.message : '批量操作失败', 'error'); }
  }

  async function handleBatchReject() {
    const pendingIds = [...selectedIds].filter(id => {
      const c = items.find(i => i.id === id);
      return c && c.status === 'pending';
    });
    if (pendingIds.length === 0) { toast('没有待审核的评论', 'info'); return; }
    try {
      await Promise.all(pendingIds.map(id => apiData(`${API_PREFIX}/admin/comments/${id}/reject`, { method: 'POST' })));
      toast(`成功拒绝 ${pendingIds.length} 条评论`, 'success');
      setSelectedIds(new Set());
      await fetchComments(page);
    } catch (error) { toast(error instanceof Error ? error.message : '批量操作失败', 'error'); }
  }

  async function handleBatchDelete() {
    setBatchDeleteOpen(true);
  }

  async function confirmBatchDelete() {
    try {
      await Promise.all([...selectedIds].map(id =>
        apiData(`${API_PREFIX}/admin/comments/${id}`, { method: 'DELETE' })
      ));
      toast(`成功删除 ${selectedIds.size} 条评论`, 'success');
      setSelectedIds(new Set());
      await fetchComments(page);
    } catch (error) { toast(error instanceof Error ? error.message : '批量删除失败', 'error'); }
    finally { setBatchDeleteOpen(false); }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map(c => c.id)));
  }

  const pendingCount = useMemo(() => items.filter((i) => i.status === 'pending').length, [items]);

  if (loading && items.length === 0) return <PostsSkeleton />;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <StatsCard icon={<IconMessageSquare size={20} />} value={total} label="评论总数" theme="blue" />
        <StatsCard icon={<IconClock size={20} />} value={pendingCount} label="待审核" theme="amber" />
      </div>

      <PageHeader
        title="评论管理"
        subtitle={`共 ${total} 条评论`}
        actions={
          selectedIds.size > 0 ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button variant="success" size="sm" onClick={handleBatchApprove}>
                <IconCheckCircle size={14} /> 批量通过 ({[...selectedIds].filter(id => items.find(i => i.id === id)?.status === 'pending').length})
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBatchReject}>
                <IconBan size={14} /> 批量拒绝
              </Button>
              <Button variant="danger" size="sm" onClick={handleBatchDelete}>
                <IconTrash2 size={14} /> 删除 ({selectedIds.size})
              </Button>
            </div>
          ) : undefined
        }
      />

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ ...TH, width: '44px', textAlign: 'center' as const }}>
                <button
                  onClick={toggleSelectAll}
                  style={{
                    width: '18px', height: '18px', borderRadius: '4px',
                    border: `1.5px solid ${selectedIds.size === items.length && items.length > 0 ? 'var(--primary-500)' : 'var(--border-default)'}`,
                    background: selectedIds.size === items.length && items.length > 0 ? 'var(--primary-500)' : 'transparent',
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {selectedIds.size === items.length && items.length > 0 && <IconCheck size={12} color="#fff" />}
                </button>
              </th>
              <th style={TH}>用户</th>
              <th style={TH}>内容</th>
              <th style={TH}>文章</th>
              <th style={{ ...TH, width: '88px' }}>状态</th>
              <th style={{ ...TH, width: '140px' }}>时间</th>
              <th style={{ ...TH, width: '120px', textAlign: 'right' as const }}>操作</th>
            </tr></thead>
            <tbody>
              {items.length > 0 ? items.map((cmt) => {
                const isSelected = selectedIds.has(cmt.id);
                const isPending = cmt.status === 'pending';
                return (
                  <tr key={cmt.id}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = isPending ? '#fffbeb' : 'var(--primary-50)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    style={{ transition: 'background 0.12s ease', background: isSelected ? 'var(--primary-50)' : 'transparent' }}
                  >
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <button
                        onClick={() => toggleSelect(cmt.id)}
                        style={{
                          width: '18px', height: '18px', borderRadius: '4px',
                          border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-default)'}`,
                          background: isSelected ? 'var(--primary-500)' : 'transparent',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected && <IconCheck size={12} color="#fff" />}
                      </button>
                    </td>
                    <td style={{ ...TD, width: '130px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600 }}>{esc(cmt.display_name)}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{esc(cmt.username)}</span>
                      </div>
                    </td>
                    <td style={{ ...TD, maxWidth: '220px' }}>
                      <span style={{
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                        overflow: 'hidden', lineHeight: 1.55, color: 'var(--text-secondary)',
                      }}>{esc(cmt.content)}</span>
                    </td>
                    <td style={{ ...TD, maxWidth: '160px' }}>
                      {cmt.post_title ? (
                        <a href={`/${cmt.post_content_type === 'page' ? 'pages' : 'posts'}/${cmt.post_slug || ''}`} target="_blank" rel="noreferrer"
                          title={cmt.post_title} style={{
                            fontSize: '12px', color: 'var(--primary-500)', textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        ><IconExternalLink size={11} />{esc(cmt.post_title)}</a>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>文章已删除</span>
                      )}
                    </td>
                    <td style={TD}><StatusBadge status={cmt.status} /></td>
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {cmt.created_at?.slice(0, 16).replace('T', ' ') || '—'}
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {cmt.status === 'pending' && (
                          <>
                            <button
                              title="通过"
                              style={{ ...iconBtn, background: 'transparent', color: '#10b981' }}
                              onClick={() => handleApprove(cmt.id)}
                              onMouseEnter={e => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.color = '#059669'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
                            ><IconCheckCircle size={16} /></button>
                            <button
                              title="拒绝"
                              style={{ ...iconBtn, background: 'transparent', color: '#f59e0b' }}
                              onClick={() => handleReject(cmt.id)}
                              onMouseEnter={e => { e.currentTarget.style.background = '#fffbeb'; e.currentTarget.style.color = '#d97706'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f59e0b'; }}
                            ><IconBan size={16} /></button>
                          </>
                        )}
                        <button
                          title="删除"
                          style={{ ...iconBtn, background: 'transparent', color: '#ef4444' }}
                          onClick={() => setDeleteTarget(cmt)}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                        ><IconTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7}>
                  <EmptyState icon={<IconMessageSquare size={28} />} message="暂无评论" />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </Card>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete}
        title="删除评论" message={`确定要删除 ${deleteTarget?.display_name || ''} 的评论吗？`} variant="danger" confirmText="删除" />

      <ConfirmDialog open={batchDeleteOpen} onClose={() => setBatchDeleteOpen(false)} onConfirm={confirmBatchDelete}
        title="批量删除评论" message={`确定要删除选中的 ${selectedIds.size} 条评论吗？此操作不可恢复。`}
        variant="danger" confirmText={`删除 ${selectedIds.size} 条`} />
    </>
  );
}
