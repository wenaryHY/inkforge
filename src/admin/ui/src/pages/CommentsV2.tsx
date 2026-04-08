import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  IconMessageSquare,
  IconClock,
  IconCheckCircle,
  IconTrash2,
  IconExternalLink,
  IconCheck,
  IconBan,
} from '../components/Icons';
import { useToast } from '../contexts/ToastContext';
import { useI18n } from '../i18n';

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
  padding: '14px 16px',
  fontSize: '13px',
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

export default function CommentsV2() {
  const toast = useToast();
  const navigate = useNavigate();
  const { t, format } = useI18n();
  const [items, setItems] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  const fetchComments = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          page_size: '15',
        });

        const payload = await apiData<PaginatedResponse<Comment>>(
          `/api/admin/comments?${params.toString()}`
        );
        setItems(payload.items || []);
        setTotal(payload.pagination.total || 0);
        setPages(paginationPages(payload));
      } catch (error) {
        toast(error instanceof Error ? error.message : t('loadCommentsFailed'), 'error');
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    void fetchComments(page);
  }, [page, fetchComments]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  async function handleApprove(id: string) {
    try {
      await apiData(`/api/admin/comments/${id}/approve`, { method: 'POST' });
      toast(t('approvedSuccess'), 'success');
      await fetchComments(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('actionFailed'), 'error');
    }
  }

  async function handleReject(id: string) {
    try {
      await apiData(`/api/admin/comments/${id}/reject`, { method: 'POST' });
      toast(t('rejectedSuccess'), 'success');
      await fetchComments(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('actionFailed'), 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await apiData(`/api/admin/comments/${deleteTarget.id}`, { method: 'DELETE' });
      toast(t('movedToTrashSuccess'), 'success');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      await fetchComments(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('deleteFailed'), 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleBatchApprove() {
    const pendingIds = [...selectedIds].filter((id) => {
      const c = items.find((i) => i.id === id);
      return c && c.status === 'pending';
    });
    if (pendingIds.length === 0) {
      toast(t('noPendingComments'), 'info');
      return;
    }

    try {
      await Promise.all(
        pendingIds.map((id) => apiData(`/api/admin/comments/${id}/approve`, { method: 'POST' }))
      );
      toast(format('batchApproveSuccess', { count: pendingIds.length }), 'success');
      setSelectedIds(new Set());
      await fetchComments(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('batchActionFailed'), 'error');
    }
  }

  async function handleBatchReject() {
    const pendingIds = [...selectedIds].filter((id) => {
      const c = items.find((i) => i.id === id);
      return c && c.status === 'pending';
    });
    if (pendingIds.length === 0) {
      toast(t('noPendingComments'), 'info');
      return;
    }

    try {
      await Promise.all(
        pendingIds.map((id) => apiData(`/api/admin/comments/${id}/reject`, { method: 'POST' }))
      );
      toast(format('batchRejectSuccess', { count: pendingIds.length }), 'success');
      setSelectedIds(new Set());
      await fetchComments(page);
    } catch (error) {
      toast(error instanceof Error ? error.message : t('batchActionFailed'), 'error');
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((c) => c.id)));
  }

  const pendingCount = useMemo(
    () => items.filter((i) => i.status === 'pending').length,
    [items]
  );

  if (loading && items.length === 0) return <PostsSkeleton />;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <StatsCard icon={<IconMessageSquare size={20} />} value={total} label={t('commentsTotal')} theme="blue" />
        <StatsCard icon={<IconClock size={20} />} value={pendingCount} label={t('pendingReview')} theme="amber" />
      </div>

      <PageHeader
        title={t('commentsTitle')}
        subtitle={format('commentsCount', { count: total })}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {selectedIds.size > 0 && (
              <>
                <Button variant="success" size="sm" onClick={handleBatchApprove}>
                  <IconCheckCircle size={14} /> {t('batchApprove')}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBatchReject}>
                  <IconBan size={14} /> {t('batchReject')}
                </Button>
                <Button variant="danger" size="sm" onClick={() => setBatchDeleteOpen(true)}>
                  <IconTrash2 size={14} /> {format('batchDeleteComments', { count: selectedIds.size })}
                </Button>
              </>
            )}
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
          {t('activeComments')}
        </button>
        <button
          onClick={() => navigate('/trash?tab=comment')}
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: '44px', textAlign: 'center' as const }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `1.5px solid ${selectedIds.size === items.length && items.length > 0 ? 'var(--primary-500)' : 'var(--border-default)'}`,
                      background: selectedIds.size === items.length && items.length > 0 ? 'var(--primary-500)' : 'transparent',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedIds.size === items.length && items.length > 0 && <IconCheck size={12} color="#fff" />}
                  </button>
                </th>
                <th style={TH}>{t('userLabel')}</th>
                <th style={TH}>{t('contentLabel')}</th>
                <th style={TH}>{t('postLabel')}</th>
                <th style={{ ...TH, width: '90px' }}>{t('statusLabel')}</th>
                <th style={{ ...TH, width: '140px' }}>{t('timeLabel')}</th>
                <th style={{ ...TH, width: '120px', textAlign: 'right' as const }}>{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((cmt) => {
                  const isSelected = selectedIds.has(cmt.id);
                  return (
                    <tr
                      key={cmt.id}
                      style={{
                        transition: 'background 0.12s ease',
                        background: isSelected ? 'var(--primary-50)' : 'transparent',
                      }}
                    >
                      <td style={{ ...TD, textAlign: 'center' }}>
                        <button
                          onClick={() => toggleSelect(cmt.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `1.5px solid ${isSelected ? 'var(--primary-500)' : 'var(--border-default)'}`,
                            background: isSelected ? 'var(--primary-500)' : 'transparent',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
                        <span
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical' as const,
                            overflow: 'hidden',
                            lineHeight: 1.55,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {esc(cmt.content)}
                        </span>
                      </td>

                      <td style={{ ...TD, maxWidth: '160px' }}>
                        {cmt.post_title ? (
                          <a
                            href={`/posts/${cmt.post_slug || ''}`}
                            target="_blank"
                            rel="noreferrer"
                            title={cmt.post_title}
                            style={{
                              fontSize: '12px',
                              color: 'var(--primary-500)',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <IconExternalLink size={11} />
                            {esc(cmt.post_title)}
                          </a>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            {t('deletedPost')}
                          </span>
                        )}
                      </td>

                      <td style={TD}>
                        <StatusBadge status={cmt.status} />
                      </td>

                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {cmt.created_at?.slice(0, 16).replace('T', ' ') || '-'}
                      </td>

                      <td style={TD}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {cmt.status === 'pending' && (
                            <>
                              <button
                                title={t('approveAction')}
                                style={{ ...iconBtn, background: 'transparent', color: '#10b981' }}
                                onClick={() => handleApprove(cmt.id)}
                              >
                                <IconCheckCircle size={16} />
                              </button>
                              <button
                                title={t('rejectAction')}
                                style={{ ...iconBtn, background: 'transparent', color: '#f59e0b' }}
                                onClick={() => handleReject(cmt.id)}
                              >
                                <IconBan size={16} />
                              </button>
                            </>
                          )}

                          <button
                            title={t('moveToTrash')}
                            style={{ ...iconBtn, background: 'transparent', color: '#ef4444' }}
                            onClick={() => setDeleteTarget(cmt)}
                          >
                            <IconTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={<IconMessageSquare size={28} />} message={t('noComments')} />
                  </td>
                </tr>
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
        title={t('deleteCommentTitle')}
        message={format('deleteCommentMessage', { name: deleteTarget?.display_name || '' })}
        variant="danger"
        confirmText={t('moveToTrashConfirm')}
      />

      <ConfirmDialog
        open={batchDeleteOpen}
        onClose={() => setBatchDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await Promise.all([...selectedIds].map((id) => apiData(`/api/admin/comments/${id}`, { method: 'DELETE' })));
            toast(`${t('movedToTrashSuccess')} ${selectedIds.size} ${t('items')}`, 'success');
            setSelectedIds(new Set());
            await fetchComments(page);
          } catch (error) {
            toast(error instanceof Error ? error.message : t('batchDeleteFailed'), 'error');
          } finally {
            setBatchDeleteOpen(false);
          }
        }}
        title={t('batchDeleteCommentTitle')}
        message={format('batchDeleteCommentMessage', { count: selectedIds.size })}
        variant="danger"
        confirmText={format('deleteCommentsConfirm', { count: selectedIds.size })}
      />
    </>
  );
}
