import { useState, useRef } from 'react';
import { getToken } from '../lib/api';
import { esc } from '../lib/utils';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import { IconUpload, IconCheckCircle, IconAlertCircle } from '../components/Icons';

export default function Upload() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    doUpload(file);
  }

  function doUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    setResult(null);
    fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    }).then(res => res.json()).then(data => {
      if (data.code === 0) {
        setResult({ success: true, message: data.data.url, url: data.data.url });
        toast('上传成功', 'success');
      } else {
        setResult({ success: false, message: data.message || '上传失败' });
        toast(data.message || '上传失败', 'error');
      }
    }).catch(err => {
      const msg = err instanceof Error ? err.message : '未知错误';
      setResult({ success: false, message: msg });
      toast('网络错误', 'error');
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  }

  return (
    <>
      <PageHeader title="文件上传" subtitle="上传图片、文档等文件到服务器" />

      <Card>
        <div className="p-5">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl py-16 text-center cursor-pointer transition-all duration-200
              ${dragOver
                ? 'border-primary bg-primary-50/50'
                : 'border-border hover:border-primary/40 hover:bg-primary-50/20'}`}>
            <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center
              ${dragOver ? 'bg-primary/10' : 'bg-bg-secondary'} transition-all duration-200`}>
              <IconUpload size={28} className={dragOver ? 'text-primary' : 'text-text-muted'} />
            </div>
            <p className="text-text-main font-medium mb-1">点击选择文件或拖拽文件到此处</p>
            <p className="text-text-muted text-xs">支持 JPG / PNG / GIF / WebP / PDF 等格式，最大 10MB</p>
          </div>

          <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />

          {result && (
            <div className="mt-5 animate-in fade-in zoom-in-95 duration-200">
              {result.success ? (
                <div className="bg-success-bg/70 px-5 py-4 rounded-xl text-emerald-800 border border-success-border/70 flex items-start gap-3">
                  <IconCheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1">上传成功</p>
                    <a href={result.url} target="_blank" rel="noreferrer" className="hover:underline break-all text-emerald-700 font-mono text-xs">{esc(result.message)}</a>
                    {result.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <img src={result.url} alt="preview" className="max-w-xs mt-3 rounded-lg border border-success-border/50 shadow-sm"
                        onError={(e) => (e.currentTarget.style.display = 'none')} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-danger-bg/70 px-5 py-4 rounded-xl text-red-800 border border-danger-border/70 flex items-start gap-3">
                  <IconAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">上传失败</p>
                    <p className="text-xs mt-0.5 opacity-80">{esc(result.message)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
