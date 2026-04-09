import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TiptapPanel({ value, onChange }: Props) {
  const isExternalUpdateRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ inline: false }),
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      if (isExternalUpdateRef.current) return;
      const md = editor.storage.markdown.getMarkdown();
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // Sync external value changes (e.g. from CodeMirror source panel)
  useEffect(() => {
    if (!editor) return;
    const currentMarkdown = editor.storage.markdown.getMarkdown();
    if (currentMarkdown !== value && value !== undefined) {
      isExternalUpdateRef.current = true;
      editor.commands.setContent(value || '');
      isExternalUpdateRef.current = false;
    }
  }, [value, editor]);

  // Register global insert function for media library
  useEffect(() => {
    if (!editor) return;
    (window as any).inkforgeInsertMarkdown = (text: string) => {
      // If it's an image markdown syntax, insert as image node
      const imageMatch = text.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        editor.chain().focus().setImage({ src: imageMatch[2], alt: imageMatch[1] }).run();
      } else {
        // Fallback: insert as text content
        editor.chain().focus().insertContent(text).run();
      }
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '14px 18px',
        background: 'var(--bg-card)',
      }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
