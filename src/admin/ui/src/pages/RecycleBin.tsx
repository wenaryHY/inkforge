import { useCallback, useEffect, useMemo, useState } from 'react';
import { listTrash, restoreTrashItem, purgeTrashItem, purgeExpiredTrash } from '../lib/api';
import type { TrashItem } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { CardTableSkeleton } from '../components/Skeleton';
import { useToast } from '../contexts/ToastContext';
import {
  IconTrash2, IconRefreshCw, IconFileText, IconFolderOpen,
  IconTag, IconImage, IconFolder, IconCheck,
} from '../components/Icons';

/* ═════════════ 类型标签配置 ═════════════ */
const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  post: { label: '文章', icon: <IconFileText size={14} />, color: '#3b82f6' },
  category: { label: '分类', icon: <IconFolderOpen size={14} />, color: '#8b5cf6' },
  tag: { label: '标签', icon: <IconTag size={14} />, color: '#10b981' },
  media: { label: '媒体', icon: <IconImage size={14} />, color: '#f59e0b' },
  media_category: { label: '媒体分类', icon: <IconFolder size={14} />, color: '#ec4899' },
};

const TABS = [
  { key: '', label: '全部' },
  { key: 'post', label: '文章' },
  { key: 'category', label: '分类' },
  { key: 'tag', label: '标签' },
  { key: 'media', label: '媒体' },
  { key: 'media_category', label: '媒体分类' },
];

/* ═════════════ 样式 ═════════════ */
const TH: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  background: 'var(--bg-subtle)',
  borderBottom: '1px solid var(--border-light)',
};

const TD: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '13px',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-light)',
  verticalAlign: 'middle',
};

const iconBtn = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '32px', height: '32px', borderRadius: '8px',
  color, cursor: 'pointer', border: 'none', background: 'transparent',
  transition: 'all 0.15s ease', flexShrink: 0,
});

/* ═════════════ 工具函数 ═════════════ */
function formatDeletedAt(dateStr: string): string {
  if (!dateStr) return '—';
  return dateStr.replace('T', ' ').slice(0, 16);
}

function expiresLabel(days: number): { text: string; color: string } {
  if (days <= 0) return { text: '已过期', color: '#ef4444' };
  if (days <= 3) return { text: `${days}天后删除`, color: '#ef4444' };
  if (days <= 7) return { text: `${days}天后删除`, color: '#f59e0b' };
  return { text: `${days}天后删除`, color: 'var(--text-muted)' };
}

/* ═════════════ 预览面板 ═════════════ */
function PreviewPanel({ item, onClose }: { item: TrashItem; onClose: () => void }) {
  const config = TYPE_CONFIG[item.item_type];
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px',
      background: 'var(--bg-card)', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.25s ease',
    }}>
      {/* 头部 */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: `${config?.color || '#999'}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: config?.color || '#999',
          }}>
            {config?.icon}
          </span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>
              预览
            </div>
            <span style={{
              fontSize: '11px', fontWeight: 600,
              padding: '2px 8px', borderRadius: '999px',
              background: `${config?.color || '#999'}18`,
              color: config?.color || '#999',
            }}>
              {config?.label || item.item_type}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            border: 'none', background: 'var(--bg-subtle)', cursor: 'pointer',
            width: '28px', height: '28px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: '16px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        >✕</button>
      </div>
      {/* 内容 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            {item.item_type === 'post' ? '标题' : '名称'}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--if-text)', lineHeight: 1.5 }}>
            {item.name}
          </div>
        </div>
        {item.subtitle && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              {item.item_type === 'media' ? 'MIME 类型' : 'Slug'}
            </div>
            <div style={{
              fontSize: '13px', color: 'var(--text-secondary)',
              fontFamily: 'monospace', background: 'var(--bg-subtle)',
              padding: '8px 12px', borderRadius: '8px',
            }}>
              {item.subtitle}
            </div>
          </div>
        )}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            删除时间
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {formatDeletedAt(item.deleted_at)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            自动清理倒计时
          </div>
          {(() => {
            const exp = expiresLabel(item.expires_in_days);
            return (
              <div style={{
                fontSize: '14px', fontWeight: 600, color: exp.color,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: exp.color, display: 'inline-block',
                  animation: item.expires_in_days <= 3 ? 'pulse 1.5s infinite' : 'none',
                }} />
                {exp.text}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ═════════════ 主组件 ═════════════ */
export default function RecycleBin() {
  const toast = useToast();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<TrashItem | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<TrashItem | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<TrashItem | null>(null);
  const [batchAction, setBatchAction] = useState<'restore' | 'purge' | null>(null);
  const [purging, setPurging] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTrash(activeTab || undefined);
      setItems(data || []);
    } catch (error) {
      toast(error instanceof Error ? error.message : '加载回收站失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => { void fetchItems(); }, [fetchItems]);
  useEffect(() => { setSelectedIds(new Set()); }, [activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { '': items.length };
    for (const item of items) {
      counts[item.item_type] = (counts[item.item_type] || 0) + 1;
    }
    return counts;
  }, [items]);

  // 只统计当前 tab 的（如果有 tab 筛选的话 items 已经被后端过滤）
  const filteredItems = items;

  async function handleRestore(item: TrashItem) {
    try {
      await restoreTrashItem(item.item_type, item.id);
      toast(`「${item.name}」已恢复`, 'success');
      setRestoreTarget(null);
      setPreviewItem(null);
      await fetchItems();
    } catch (error) {
      toast(error instanceof Error ? error.message : '恢复失败', 'error');
    }
  }

  async function handlePurge(item: TrashItem) {
    try {
      await purgeTrashItem(item.item_type, item.id);
      toast(`「${item.name}」已永久删除`, 'success');
      setPurgeTarget(null);
      setPreviewItem(null);
      await fetchItems();
    } catch (error) {
      toast(error instanceof Error ? error.message : '永久删除失败', 'error');
    }
  }

  async function handleBatchAction() {
    if (!batchAction || selectedIds.size === 0) return;
    const selected = filteredItems.filter(i => selectedIds.has(i.id));
    try {
      if (batchAction === 'restore') {
        await Promise.all(selected.map(i => restoreTrashItem(i.item_type, i.id)));
        toast(`已恢复 ${selected.length} 项`, 'success');
      } else {
        await Promise.all(selected.map(i => purgeTrashItem(i.item_type, i.id)));
        toast(`已永久删除 ${selected.length} 项`, 'success');
      }
      setSelectedIds(new Set());
      setBatchAction(null);
      await fetchItems();
    } catch (error) {
      toast(error instanceof Error ? error.message : '批量操作失败', 'error');
    }
  }

  async function handlePurgeExpired() {
    setPurging(true);
    try {
      await purgeExpiredTrash();
      toast('已清理过期数据', 'success');
      await fetchItems();
    } catch (error) {
      toast(error instanceof Error ? error.message : '清理失败', 'error');
    } finally {
      setPurging(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  }

  if (loading && items.length === 0) return <CardTableSkeleton cols={5} rows={4} />;

  return (
    <>
      <PageHeader
        title="回收站"
        subtitle={`共 ${items.length} 项已删除内容`}
        actions={
          <Button
            variant="ghost"
            onClick={handlePurgeExpired}
            loading={purging}
            disabled={purging}
          >
            <IconTrash2 size={14} /> 清理过期数据
          </Button>
        }
      />

      {/* Tab 筛选 */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '16px',
        background: 'var(--bg-card)', padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        overflowX: 'auto',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const count = tab.key === '' ? items.length : (tabCounts[tab.key] || 0);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: isActive ? 600 : 400,
                background: isActive ? 'var(--primary-500)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.18s ease',
                display: 'flex', alignItems: 'center', gap: '6px',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {tab.label}
              {count > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 700,
                  padding: '1px 6px', borderRadius: '999px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  minWidth: '18px', textAlign: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
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
              已选择 {selectedIds.size} 项
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button size="sm" variant="ghost" onClick={() => setBatchAction('restore')}>
                <IconRefreshCw size={14} /> 批量恢复
              </Button>
              <Button size="sm" variant="danger" onClick={() => setBatchAction('purge')}>
                <IconTrash2 size={14} /> 批量永久删除
              </Button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: '44px', textAlign: 'center' }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      width: '18px', height: '18px', borderRadius: '4px',
                      border: `1.5px solid ${selectedIds.size === filteredItems.length && filteredItems.length > 0 ? 'var(--primary-500)' : 'var(--border-default)'}`,
                      background: selectedIds.size === filteredItems.length && filteredItems.length > 0 ? 'var(--primary-500)' : 'transparent',
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {selectedIds.size === filteredItems.length && filteredItems.length > 0 && (
                      <IconCheck size={12} color="#fff" />
                    )}
                  </button>
                </th>
                <th style={TH}>类型</th>
                <th style={TH}>名称</th>
                <th style={{ ...TH, width: '140px' }}>删除时间</th>
                <th style={{ ...TH, width: '100px' }}>剩余时间</th>
                <th style={{ ...TH, width: '140px', textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? filteredItems.map(item => {
                const config = TYPE_CONFIG[item.item_type];
                const exp = expiresLabel(item.expires_in_days);
                const isSelected = selectedIds.has(item.id);
                return (
                  <tr
                    key={`${item.item_type}-${item.id}`}
                    onClick={() => setPreviewItem(item)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                      background: isSelected ? 'var(--primary-50)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'var(--primary-50)' : 'transparent'; }}
                  >
                    <td style={{ ...TD, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSelect(item.id)}
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
                    <td style={TD}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        background: `${config?.color || '#999'}12`,
                        color: config?.color || '#999',
                      }}>
                        {config?.icon} {config?.label || item.item_type}
                      </span>
                    </td>
                    <td style={{ ...TD, fontWeight: 600 }}>
                      <div>
                        <div style={{ fontSize: '13.5px', color: 'var(--if-text)' }}>{item.name}</div>
                        {item.subtitle && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ ...TD, fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatDeletedAt(item.deleted_at)}
                    </td>
                    <td style={TD}>
                      <span style={{
                        fontSize: '12px', fontWeight: 600, color: exp.color,
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: exp.color, display: 'inline-block',
                        }} />
                        {exp.text}
                      </span>
                    </td>
                    <td style={TD} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        {/* 恢复 */}
                        <button
                          title="恢复"
                          style={iconBtn('#10b981')}
                          onClick={() => setRestoreTarget(item)}
                          onMouseEnter={e => { e.currentTarget.style.background = '#d1fae5'; e.currentTarget.style.color = '#059669'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
                        >
                          <IconRefreshCw size={15} />
                        </button>
                        {/* 永久删除 */}
                        <button
                          title="永久删除"
                          style={iconBtn('#ef4444')}
                          onClick={() => setPurgeTarget(item)}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          <IconTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : null}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <EmptyState
            icon={<IconTrash2 size={28} />}
            message="回收站为空，没有已删除的内容"
          />
        )}
      </Card>

      {/* 预览面板 */}
      {previewItem && (
        <>
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 999,
            }}
            onClick={() => setPreviewItem(null)}
          />
          <PreviewPanel item={previewItem} onClose={() => setPreviewItem(null)} />
        </>
      )}

      {/* 恢复确认 */}
      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={() => restoreTarget && handleRestore(restoreTarget)}
        title="恢复内容"
        message={`确定要恢复「${restoreTarget?.name || ''}」吗？恢复后将重新出现在对应的管理列表中。`}
        confirmText="确认恢复"
        variant="info"
      />

      {/* 永久删除确认 */}
      <ConfirmDialog
        open={!!purgeTarget}
        onClose={() => setPurgeTarget(null)}
        onConfirm={() => purgeTarget && handlePurge(purgeTarget)}
        title="永久删除"
        message={`确定要永久删除「${purgeTarget?.name || ''}」吗？此操作不可恢复！`}
        confirmText="永久删除"
        variant="danger"
      />

      {/* 批量操作确认 */}
      <ConfirmDialog
        open={!!batchAction}
        onClose={() => setBatchAction(null)}
        onConfirm={handleBatchAction}
        title={batchAction === 'restore' ? '批量恢复' : '批量永久删除'}
        message={
          batchAction === 'restore'
            ? `确定要恢复选中的 ${selectedIds.size} 项内容吗？`
            : `确定要永久删除选中的 ${selectedIds.size} 项内容吗？此操作不可恢复！`
        }
        confirmText={batchAction === 'restore' ? `恢复 ${selectedIds.size} 项` : `永久删除 ${selectedIds.size} 项`}
        variant={batchAction === 'restore' ? 'info' : 'danger'}
      />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
