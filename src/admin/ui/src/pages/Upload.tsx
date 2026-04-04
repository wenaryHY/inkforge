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
      toast(error instanceof Error ? error.message : '����ý��ʧ��', 'error');
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
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || json.code !== 0) {
        throw new Error(json.message || '�ϴ�ʧ��');
      }
      setResult({ success: true, message: json.data.public_url });
      toast('�ϴ��ɹ�', 'success');
      await fetchMedia(1, kind);
      setPage(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : '�ϴ�ʧ��';
      setResult({ success: false, message });
      toast(message, 'error');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function deleteMedia(id: string) {
    try {
      await apiData(`/api/admin/media/${id}`, { method: 'DELETE' });
      toast('ɾ���ɹ�', 'success');
      await fetchMedia(page, kind);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'ɾ��ʧ��', 'error');
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void doUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void doUpload(file);
  }

  return (
    <>
      <PageHeader title="ý���" subtitle="�ϴ��͹���ͼƬ����Ƶ��Դ" />

      <Card>
        <div className="p-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl py-16 text-center cursor-pointer transition-all duration-200 ${dragOver ? 'border-primary bg-primary-50/50' : 'border-border hover:border-primary/40 hover:bg-primary-50/20'}`}
          >
            <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${dragOver ? 'bg-primary/10' : 'bg-bg-secondary'} transition-all duration-200`}>
              <IconUpload size={28} className={dragOver ? 'text-primary' : 'text-text-muted'} />
            </div>
            <p className="text-text-main font-medium mb-1">���ѡ���ļ�����ק���˴�</p>
            <p className="text-text-muted text-xs">��֧�� JPG / PNG / WebP / GIF / MP3 / OGG / WAV / M4A����� 10MB</p>
          </div>

          <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />

          {result && (
            <div className="mt-5 animate-in fade-in zoom-in-95 duration-200">
              {result.success ? (
                <div className="bg-success-bg/70 px-5 py-4 rounded-xl text-emerald-800 border border-success-border/70 flex items-start gap-3">
                  <IconCheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1">�ϴ��ɹ�</p>
                    <a href={result.message} target="_blank" rel="noreferrer" className="hover:underline break-all text-emerald-700 font-mono text-xs">{esc(result.message)}</a>
                  </div>
                </div>
              ) : (
                <div className="bg-danger-bg/70 px-5 py-4 rounded-xl text-red-800 border border-danger-border/70 flex items-start gap-3">
                  <IconAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">�ϴ�ʧ��</p>
                    <p className="text-xs mt-0.5 opacity-80">{esc(result.message)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-text-main">ý���б�</div>
          <div className="w-48">
            <Select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }}>
              <option value="">ȫ������</option>
              <option value="image">ͼƬ</option>
              <option value="audio">��Ƶ</option>
            </Select>
          </div>
        </div>
        <div className="px-5 pb-5">
          {loading ? (
            <div className="text-sm text-text-muted">������...</div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-bg-secondary/40 p-4 flex flex-col gap-3">
                  <div className="text-sm font-semibold text-text-main break-all">{esc(item.original_name)}</div>
                  <div className="text-xs text-text-muted">{item.kind} �� {item.mime_type}</div>
                  <div className="text-xs text-text-muted">{Math.ceil(item.size_bytes / 1024)} KB</div>
                  <a href={item.public_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">{item.public_url}</a>
                  <div className="flex items-center justify-between gap-2">
                    {item.kind === 'image' ? (
                      <img src={item.public_url} alt={item.original_name} className="h-16 w-16 object-cover rounded-lg border border-border" />
                    ) : (
                      <audio controls src={item.public_url} className="w-full h-10" />
                    )}
                    <Button size="sm" variant="danger" onClick={() => void deleteMedia(item.id)}><IconTrash2 size={13} /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-text-muted">����ý���ļ���</div>
          )}
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </Card>
    </>
  );
}
