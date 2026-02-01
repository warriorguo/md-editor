import { useRef, useCallback, useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { Root, SyncSource } from '../lib/ast/types';
import { parseMarkdown } from '../lib/ast/parser';
import { serializeToMarkdown } from '../lib/ast/serializer';
import { mdastToProseMirror, proseMirrorToMdast } from '../lib/ast/transformer';

interface UseASTSyncOptions {
  onASTChange?: (ast: Root) => void;
  onMarkdownChange?: (markdown: string) => void;
}

interface UseASTSyncReturn {
  ast: Root | null;
  markdown: string;
  syncFromMarkdown: (markdown: string) => void;
  syncFromRichText: (editor: Editor) => void;
  setEditor: (editor: Editor | null) => void;
  lastSyncSource: SyncSource | null;
}

export function useASTSync(options: UseASTSyncOptions = {}): UseASTSyncReturn {
  const { onASTChange, onMarkdownChange } = options;

  const [ast, setAst] = useState<Root | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [lastSyncSource, setLastSyncSource] = useState<SyncSource | null>(null);

  const editorRef = useRef<Editor | null>(null);
  const syncingRef = useRef(false);

  const setEditor = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);

  const syncFromMarkdown = useCallback(
    (newMarkdown: string) => {
      if (syncingRef.current) return;

      syncingRef.current = true;
      setLastSyncSource('markdown');

      try {
        // Parse markdown to AST
        const newAst = parseMarkdown(newMarkdown);
        setAst(newAst);
        setMarkdown(newMarkdown);

        // Notify listeners
        onASTChange?.(newAst);
        onMarkdownChange?.(newMarkdown);

        // Update rich text editor if available
        if (editorRef.current && !editorRef.current.isDestroyed) {
          const proseMirrorDoc = mdastToProseMirror(newAst);
          editorRef.current.commands.setContent(proseMirrorDoc);
        }
      } finally {
        syncingRef.current = false;
      }
    },
    [onASTChange, onMarkdownChange]
  );

  const syncFromRichText = useCallback(
    (editor: Editor) => {
      if (syncingRef.current) return;

      syncingRef.current = true;
      setLastSyncSource('richtext');

      try {
        // Convert ProseMirror to MDAST
        const proseMirrorDoc = editor.getJSON();
        const newAst = proseMirrorToMdast(proseMirrorDoc);
        setAst(newAst);

        // Serialize to markdown
        const newMarkdown = serializeToMarkdown(newAst);
        setMarkdown(newMarkdown);

        // Notify listeners
        onASTChange?.(newAst);
        onMarkdownChange?.(newMarkdown);
      } finally {
        syncingRef.current = false;
      }
    },
    [onASTChange, onMarkdownChange]
  );

  return {
    ast,
    markdown,
    syncFromMarkdown,
    syncFromRichText,
    setEditor,
    lastSyncSource,
  };
}
