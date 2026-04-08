import { useCallback, useEffect, useRef, useState } from 'react';
import { apiData, getToken, paginationPages } from '../lib/api';
import { esc } from '../lib/utils';
import type { MediaItem, PaginatedResponse } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Pagination } from '../components/Pagination';
import { Select as IfSelect } from '../components/Select';
import { useToast } from '../contexts/ToastContext';
import { useMediaCategories } from '../hooks/useMediaCategories';
import { MediaCategorySelect } from '../components/media/MediaCategorySelect';
import { IconUpload, IconCheckCircle, IconAlertCircle, IconTrash2, IconSearch, IconEdit2, IconFolder } from '../components/Icons';

const dropZoneBase: React.CSSProperties = {
  border: '2px dashed var(--border-default)', borderRadius: '14px',
  padding: '52px 24px', textAlign: 'center', cursor: 'pointer',
  transition: 'all 0.2s ease',
};
const dropZoneActive: React.CSSProperties = {
  ...dropZoneBase,
  borderColor: 'var(--primary-500)',
  background: 'rgba(255,107,53,0.04)',
};

export default function Upload() {
  const toast = useToast();
  const { categories, fetch: fetchCategories } = useMediaCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [kind, setKind] = useState('');
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  // 重命名状态：id -> 是否在编辑
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // 初始化时加载分类
  useEffect(() => {
    void fetchCategories().catch(err => {
      console.error('Failed to load media categories:', err);
    });
  }, [fetchCategories]);

  const fetchMedia = useCallback(async (nextPage: number, nextKind: string, nextCategory: string, nextKeyword: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(nextPage), page_size: '16' });
      if (nextKind) query.set('kind', nextKind);
      if (nextCategory) query.set('category', nextCategory);
      if (nextKeyword.trim()) query.set('keyword', nextKeyword.trim());
      const payload = await apiData<PaginatedResponse<MediaItem>>(`/api/admin/media?${query.toString()}`);
      setItems(payload.items || []);
      setPages(paginationPages(payload));
    } catch (error) {
      toast(error instanceof Error ? error.message : '加载媒体失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchMedia(page, kind, category, keyword); }, [page, kind, category, keyword, fetchMedia]);

   async function doUpload(file: File) {
     const fd = new FormData();
     fd.append('file', file);
     if (category) fd.append('category', category);
     setResult(null);
     try {
      const res = await fetch('/api/admin/media', {
         method: 'POST',
         headers: { Authorization: `Bearer ${getToken()}` },
         body: fd
       });
       const json = await res.json();
       if (!res.ok || json.code !== 0) throw new Error(json.message || '上传失败');
       setResult({ success: true, message: json.data.public_url });
       toast('上传成功', 'success');
       await fetchMedia(1, kind, category, keyword);
       setPage(1);
     } catch (error) {
       const msg = error instanceof Error ? error.message : '上传失败';
       setResult({ success: false, message: msg });
       toast(msg, 'error');
     }
     if (fileInputRef.current) fileInputRef.current.value = '';
   }

  async function deleteMedia(id: string) {
    if (!window.confirm('确定要删除此文件吗？')) return;
    try {
      await apiData(`/api/admin/media/${id}`, { method: 'DELETE' });
      toast('删除成功', 'success');
      await fetchMedia(page, kind, category, keyword);
    } catch (error) {
      toast(error instanceof Error ? error.message : '删除失败', 'error');
    }
  }

  function startRename(item: MediaItem) {
    setRenamingId(item.id);
    setRenameValue(item.original_name);
  }

  async function commitRename(id: string) {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    try {
      await apiData(`/api/admin/media/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      toast('文件名已更新', 'success');
      setRenamingId(null);
      await fetchMedia(page, kind, category, keyword);
    } catch (error) {
      toast(error instanceof Error ? error.message : '重命名失败', 'error');
    }
  }

  async function setItemCategory(id: string, cat: string) {
    try {
      await apiData(`/api/admin/media/${id}/category`, {
        method: 'PATCH',
        body: JSON.stringify({ category: cat || null }),
      });
      await fetchMedia(page, kind, category, keyword);
    } catch (error) {
      toast(error instanceof Error ? error.message : '分类更新失败', 'error');
    }
  }

  function insertIntoEditor(url: string) {
    const insertFn = (window as any).inkforgeInsertMarkdown;
    if (!insertFn) { toast('请先打开文章编辑器', 'error'); return; }
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    const text = isImage ? `\n![](${url})\n` : `\n[文件](${url})\n`;
    insertFn(text);
    toast('已插入编辑器', 'success');
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) void doUpload(e.target.files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) void doUpload(e.dataTransfer.files[0]);
  }

  return (
    <>
      <PageHeader title="媒体管理" subtitle="上传和管理图片、音视频资源，支持文件重命名和分类" />

      {/* 上传区域 */}
      <Card>
        <div style={{ padding: '22px' }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div style={dragOver ? dropZoneActive : dropZoneBase}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              if (!dragOver) {
                e.currentTarget.style.borderColor = 'var(--primary-500)';
                e.currentTarget.style.background = 'rgba(255,107,53,0.02)';
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
              if (!dragOver) {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div style={{
              width: '56px', height: '56px', margin: '0 auto 16px',
              borderRadius: '14px', display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              background: dragOver ? 'rgba(255,107,53,0.10)' : 'var(--bg-subtle)',
              transition: 'all 0.2s',
            }}>
              <IconUpload size={28} style={{ color: dragOver ? 'var(--primary-500)' : 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--if-text)', marginBottom: '4px' }}>
              点击选择文件，或拖拽文件到此处
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              支持 JPG / PNG / WebP / GIF / MP3 / OGG / WAV / M4A，单文件最大 10MB
            </p>
          </div>
          <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />

          {result && (
            <div className="if-slide-up" style={{ marginTop: '20px' }}>
              {result.success ? (
                <div style={{
                  background: '#ecfdf5', padding: '18px 20px', borderRadius: '14px',
                  border: '1px solid #a7f3d0', display: 'flex', alignItems: 'flex-start', gap: '12px',
                }}>
                  <IconCheckCircle size={22} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#047857', marginBottom: '4px' }}>上传成功</p>
                    <a href={result.message} target="_blank" rel="noreferrer"
                      style={{ color: '#065f46', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', textDecoration: 'none' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.textDecoration = 'none'}
                    >{esc(result.message)}</a>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button type="button"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); navigator.clipboard.writeText(result.message).then(() => toast('已复制到剪贴板', 'success')).catch(() => toast('复制失败', 'error')); }}
                        style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #a7f3d0', background: '#fff', color: '#047857', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        复制链接
                      </button>
                      <button type="button"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); insertIntoEditor(result.message); }}
                        style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,107,53,0.4)', background: 'rgba(255,107,53,0.06)', color: '#e55a28', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        插入编辑器
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fef2f2', padding: '18px 20px', borderRadius: '14px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconAlertCircle size={22} style={{ color: '#dc2626', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#b91c1c' }}>上传失败</p>
                    <p style={{ fontSize: '12.5px', opacity: 0.85, marginTop: '3px' }}>{esc(result.message)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* 媒体列表 */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px 22px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>媒体列表</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <IconSearch size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input type="text" placeholder="搜索文件名..." value={keyword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setKeyword(e.target.value); setPage(1); }}
                style={{ paddingLeft: '32px', paddingRight: '10px', height: '34px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '13px', outline: 'none', width: '180px', background: 'var(--bg-card)', color: 'var(--if-text)' }}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = 'var(--primary-500)'}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = 'var(--border-default)'}
              />
            </div>
            <div style={{ width: '130px' }}>
              <IfSelect value={kind} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setKind(e.target.value); setPage(1); }}>
                <option value="">全部类型</option>
                <option value="image">图片</option>
                <option value="audio">音频</option>
              </IfSelect>
            </div>
             <div style={{ width: '130px' }}>
               <MediaCategorySelect
                 categories={categories}
                 value={category}
                 onChange={(val: string) => { setCategory(val); setPage(1); }}
                 placeholder="全部分类"
                 includeEmpty
               />
             </div>
          </div>
        </div>

        <div style={{ padding: '0 22px 22px' }}>
          {loading ? (
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>加载中...</div>
          ) : items.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  borderRadius: '14px', border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)', padding: '16px',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  transition: 'border-color 0.15s ease',
                }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-500)'}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-light)'}
                >
                  {/* 预览区 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.kind === 'image' ? (
                      <img src={item.public_url} alt={item.original_name}
                        style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-light)', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* 文件名（可重命名） */}
                      {renamingId === item.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            value={renameValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') void commitRename(item.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            autoFocus
                            style={{ flex: 1, fontSize: '12.5px', fontWeight: 600, color: 'var(--if-text)', border: '1px solid var(--primary-500)', borderRadius: '6px', padding: '2px 6px', outline: 'none', background: 'var(--bg-card)', minWidth: 0 }}
                          />
                          <button type="button" onClick={() => void commitRename(item.id)}
                            style={{ padding: '2px 6px', borderRadius: '6px', border: 'none', background: 'var(--primary-500)', color: '#fff', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
                            <IconCheckCircle size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--if-text)', wordBreak: 'break-all', lineHeight: 1.4 }} title={esc(item.original_name)}>
                          {esc(item.original_name)}
                        </div>
                      )}
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.kind === 'image' ? '图片' : '音频'} · {Math.ceil(item.size_bytes / 1024)} KB
                      </div>
                    </div>
                  </div>

                    {/* 分类标签 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconFolder size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <select
                        value={item.category || ''}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => void setItemCategory(item.id, e.target.value)}
                        style={{ flex: 1, fontSize: '11.5px', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '3px 6px', background: 'var(--bg-subtle)', cursor: 'pointer', outline: 'none', minWidth: 0 }}
                      >
                        <option value="">无分类</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                  {/* 操作按钮 */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => insertIntoEditor(item.public_url)}
                      title="插入编辑器"
                      style={{ padding: '5px 10px', borderRadius: '7px', border: '1px solid var(--border-light)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary-500)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-500)'; }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      插入
                    </button>
                    <button type="button" onClick={() => startRename(item)}
                      title="重命名"
                      style={{ padding: '5px 7px', borderRadius: '7px', border: '1px solid var(--border-light)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary-500)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-500)'; }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                    >
                      <IconEdit2 size={11} />
                    </button>
                    <button type="button" onClick={() => void deleteMedia(item.id)}
                      title="删除"
                      style={{ padding: '5px 7px', borderRadius: '7px', border: '1px solid var(--border-light)', background: 'var(--bg-subtle)', color: '#dc2626', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#dc2626'; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle)'; }}
                    >
                      <IconTrash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', fontSize: '13.5px', color: 'var(--text-muted)' }}>
              暂无媒体文件
            </div>
          )}
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </Card>
    </>
  );
}
