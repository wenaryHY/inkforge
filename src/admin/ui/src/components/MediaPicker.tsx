/**
 * MediaPicker - 从媒体库选择文件并插入编辑器的弹窗组件
 * 通过 window.inkforgeInsertMarkdown(text) 插入到当前编辑器
 */
import { useCallback, useEffect, useState } from 'react';
import { apiData, API_PREFIX } from '../lib/api';
import type { MediaItem, PaginatedResponse } from '../types';
import { Modal } from './Modal';
import { IconSearch, IconFolder } from './Icons';
import { paginationPages } from '../lib/api';

const CATEGORIES = ['封面图', '文章配图', '头像/头像', '音频文件', '其他'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MediaPicker({ open, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [kind, setKind] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchItems = useCallback(async (kw: string, k: string, cat: string, pg: number) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(pg), page_size: '20' });
      if (k) query.set('kind', k);
      if (cat) query.set('category', cat);
      if (kw.trim()) query.set('keyword', kw.trim());
      const r = await apiData<PaginatedResponse<MediaItem>>(`${API_PREFIX}/admin/media?${query.toString()}`);
      setItems(r.items || []);
      setPages(paginationPages(r));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void fetchItems(keyword, kind, category, page);
  }, [open, keyword, kind, category, page, fetchItems]);

  function insert(item: MediaItem) {
    const url = item.public_url;
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.original_name);
    const markdown = isImage
      ? `\n![${item.original_name}](${url})\n`
      : `\n[${item.original_name}](${url})\n`;
    const fn = (window as any).inkforgeInsertMarkdown;
    if (fn) fn(markdown);
    else navigator.clipboard.writeText(markdown);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="选择媒体文件" width="860px">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
          <IconSearch size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input type="text" placeholder="搜索文件名..." value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1); }}
            style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '13px', outline: 'none', background: 'var(--bg-card)', color: 'var(--if-text)' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-500)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          />
        </div>
        <select value={kind} onChange={e => { setKind(e.target.value); setPage(1); }}
          style={{ height: '36px', borderRadius: '8px', border: '1px solid var(--border-default)', padding: '0 8px', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--if-text)', cursor: 'pointer', outline: 'none' }}>
          <option value="">全部类型</option>
          <option value="image">图片</option>
          <option value="audio">音频</option>
        </select>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          style={{ height: '36px', borderRadius: '8px', border: '1px solid var(--border-default)', padding: '0 8px', fontSize: '13px', background: 'var(--bg-card)', color: 'var(--if-text)', cursor: 'pointer', outline: 'none' }}>
          <option value="">全部分类</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13.5px' }}>加载中...</div>
      ) : items.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {items.map(item => (
              <div key={item.id} onClick={() => insert(item)}
                title={`${item.original_name}\n点击插入编辑器`}
                style={{ borderRadius: '10px', border: '1.5px solid var(--border-light)', padding: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease', background: 'var(--bg-subtle)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-500)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,107,53,0.04)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-light)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-subtle)';
                }}
              >
                {item.kind === 'image' ? (
                  <img src={item.public_url} alt={item.original_name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                  />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.6"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </div>
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.3, maxWidth: '100%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                  {item.original_name}
                </span>
              </div>
            ))}
          </div>
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '5px 14px', borderRadius: '7px', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: page <= 1 ? 'var(--text-muted)' : 'var(--if-text)', fontSize: '12.5px', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
                上一页
              </button>
              <span style={{ padding: '5px 10px', fontSize: '12.5px', color: 'var(--text-muted)' }}>{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '5px 14px', borderRadius: '7px', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: page >= pages ? 'var(--text-muted)' : 'var(--if-text)', fontSize: '12.5px', cursor: page >= pages ? 'not-allowed' : 'pointer' }}>
                下一页
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '13.5px' }}>
          <IconFolder size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <div>暂无媒体文件，请先上传</div>
        </div>
      )}
    </Modal>
  );
}
