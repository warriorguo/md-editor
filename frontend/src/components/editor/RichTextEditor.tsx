import { useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import type { JSONContent } from '@tiptap/react';

interface RichTextEditorProps {
  content: JSONContent;
  onUpdate: (editor: Editor) => void;
  onEditorReady?: (editor: Editor) => void;
  className?: string;
}

export function RichTextEditor({
  content,
  onUpdate,
  onEditorReady,
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor);
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-full',
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);

      if (currentContent !== newContent) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-auto border border-gray-200 rounded-lg ${className}`}>
      <EditorContent editor={editor} className="h-full" />
    </div>
  );
}
