import { useEffect, useRef } from 'react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Called when the editor is ready */
  onEditorReady?: (editor: Editor) => void;
}

export function MilkdownPanel({ value, onChange, onEditorReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const isExternalUpdateRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, container);
        ctx.set(defaultValueCtx, value || '');
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          isExternalUpdateRef.current = true;
          onChange(markdown);
          isExternalUpdateRef.current = false;
        });
      })
      .use(commonmark)
      .use(listener);

    editorRef.current = editor;
    editor.create();
    onEditorReady?.(editor);

    // 注册全局插入函数（Milkdown 下用 DOM contenteditable 插入）
    (window as any).inkforgeInsertMarkdown = (text: string) => {
      const el = container.querySelector('[contenteditable="true"]') as HTMLElement | null;
      if (!el) return;
      el.focus();
      document.execCommand('insertText', false, text);
    };

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. when CodeMirror panel changes the shared state)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (isExternalUpdateRef.current) return;
    // Use the manager to set content
    try {
      editor.action((ctx) => {
        const defaultValue = ctx.get(defaultValueCtx);
        if (defaultValue !== value) {
          ctx.set(defaultValueCtx, value || '');
        }
      });
    } catch {
      // Ignore - editor may not be fully ready
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        borderRadius: '10px',
        border: '1px solid var(--border-default)',
        overflow: 'auto',
        padding: '14px 18px',
        fontFamily: "'Noto Sans SC', -apple-system, sans-serif",
        fontSize: '15px',
        lineHeight: 1.85,
        color: 'var(--text-primary)',
        background: 'var(--bg-card)',
      }}
    />
  );
}
