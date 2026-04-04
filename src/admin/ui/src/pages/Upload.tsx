import { useCallback, useEffect, useRef, useState } from 'react';
import { apiData, getToken, paginationPages } from '../lib/api';
import { esc } from '../lib/utils';
import type { MediaItem, PaginatedResponse } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Pagination } from '../components/Pagination';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { useToast } from '../contexts/ToastContext';
import { IconUpload, IconCheckCircle, IconAlertCircle, IconTrash2 } from '../components/Icons';

const dropZoneBase: React.CSSProperties = {
  border: '2px dashed var(--if-border)', borderRadius: '14px',
  padding: '52px 24px', textAlign: 'center', cursor: 'pointer',
  transition: 'all 0.2s ease',
};
const dropZoneActive: React.CSSProperties = {
  ...dropZoneBase,
  borderColor: 'var(--if-primary)',
  background: 'rgba(255,107,53,0.04)',
};

export default function Upload() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [kind, setKind] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async (nextPage: number, nextKind: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(nextPage), page_size: '12' });
      if (nextKind) query.set('kind', nextKind);
      const payload = await apiData<PaginatedResponse<MediaItem>>(`/api/admin/media?${query.toString()}`);
      setItems(payload.items || []);
      setPages(paginationPages(payload));
    } catch (error) {
      toast(error instanceof Error ? error.message : '加载媒体失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchMedia(page, kind); }, [page, kind, fetchMedia]);

  async function doUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
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
      await fetchMedia(1, kind);
      setPage(1);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '上传失败';
      setResult({ success: false, message: msg });
      toast(msg, 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function deleteMedia(id: string) {
    try {
      await apiData(`/api/admin/media/${id}`, { method: 'DELETE' });
      toast('删除成功', 'success');
      await fetchMedia(page, kind);
    } catch (error) {
      toast(error instanceof Error ? error.message : '删除失败', 'error');
    }
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
      <PageHeader title="媒体管理" subtitle="上传和管理图片、音视频资源" />

      {/* 上传区域 */}
      <Card>
        <div style={{ padding: '22px' }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div style={dragOver ? dropZoneActive : dropZoneBase}
            onMouseEnter={e => {
              if (!dragOver) {
                e.currentTarget.style.borderColor = 'var(--if-primary)';
                e.currentTarget.style.background = 'rgba(255,107,53,0.02)';
              }
            }}
            onMouseLeave={e => {
              if (!dragOver) {
                e.currentTarget.style.borderColor = 'var(--if-border)';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: dragOver ? 'rgba(255,107,53,0.10)' : 'var(--if-bg-secondary)',
              transition: 'all 0.2s',
            }}>
              <IconUpload size={28} style={{ color: dragOver ? 'var(--if-primary)' : 'var(--if-text-muted)' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--if-text)', marginBottom: '4px' }}>
              点击选择文件，或拖拽文件到此处
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--if-text-muted)' }}>
              支持 JPG / PNG / WebP / GIF / MP3 / OGG / WAV / M4A，单文件最大 10MB
            </p>
          </div>

          <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />

          {result && (
            <div className="if-slide-up" style={{ marginTop: '20px' }}>
              {result.success ? (
                <div style={{
                  background: '#ecfdf5',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <IconCheckCircle size={22} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#047857', marginBottom: '4px' }}>上传成功</p>
                    <a href={result.message} target="_blank" rel="noreferrer"
                      style={{
                        color: '#065f46',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        wordBreak: 'break-all',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >{esc(result.message)}</a>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#fef2f2',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px 22px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--if-text)' }}>媒体列表</span>
          <div style={{ width: '190px' }}>
            <Select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }}>
              <option value="">全部类型</option>
              <option value="image">图片</option>
              <option value="audio">音频</option>
            </Select>
          </div>
        </div>
        <div style={{ padding: '0 22px 22px' }}>
          {loading ? (
            <div style={{ fontSize: '13.5px', color: 'var(--if-text-muted)' }}>加载中...</div>
          ) : items.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {items.map((item) => (
                <div key={item.id} style={{
                  borderRadius: '14px',
                  border: '1px solid var(--if-border-light)',
                  background: 'var(--if-bg-card)',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--if-text)', wordBreak: 'break-all' }}>
                    {esc(item.original_name)}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--if-text-muted)' }}>{item.kind} · {item.mime_type}</div>
                  <div style={{ fontSize: '12px', color: 'var(--if-text-muted)' }}>{Math.ceil(item.size_bytes / 1024)} KB</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.kind === 'image' ? (
                      <img src={item.public_url} alt={item.original_name}
                        style={{
                          height: '64px',
                          width: '64px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          border: '1px solid var(--if-border-light)'
                        }}
                      />
                    ) : (
                      <audio controls src={item.public_url} style={{ width: '100%', height: '38px' }} />
                    )}
                    <Button size="sm" variant="danger" onClick={() => void deleteMedia(item.id)}>
                      <IconTrash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '13.5px', color: 'var(--if-text-muted)' }}>
              暂无媒体文件
            </div>
          )}
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </Card>
    </>
  );
}
