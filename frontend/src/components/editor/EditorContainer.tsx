import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Editor } from '@tiptap/react';
import { MarkdownEditor } from './MarkdownEditor';
import { RichTextEditor } from './RichTextEditor';
import { EditorTabs } from './EditorTabs';
import { useASTSync } from '../../hooks/useASTSync';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useOutline } from '../../hooks/useOutline';
import { parseMarkdown } from '../../lib/ast/parser';
import { mdastToProseMirror } from '../../lib/ast/transformer';
import { OutlinePanel } from '../outline/OutlinePanel';
import { ConflictModal } from './ConflictModal';

interface EditorContainerProps {
  initialContent: string;
  documentId: string;
  version: number;
  onVersionUpdate: (version: number) => void;
}

export function EditorContainer({
  initialContent,
  documentId,
  version,
  onVersionUpdate,
}: EditorContainerProps) {
  const [activeTab, setActiveTab] = useState<'markdown' | 'richtext'>('richtext');

  const {
    ast,
    markdown,
    syncFromMarkdown,
    syncFromRichText,
    setEditor,
  } = useASTSync();

  const { outline, scrollToHeading } = useOutline({ ast });

  const {
    save,
    isSaving,
    lastSaved,
    hasConflict,
    resolveConflict,
  } = useAutoSave({
    documentId,
    version,
    onVersionUpdate,
    onConflict: () => {},
    onError: (error) => console.error('Auto-save error:', error),
  });

  // Initialize with initial content
  useEffect(() => {
    if (initialContent) {
      syncFromMarkdown(initialContent);
    }
  }, [initialContent, syncFromMarkdown]);

  // Save on content change
  useEffect(() => {
    if (markdown && markdown !== initialContent) {
      save(markdown);
    }
  }, [markdown, save, initialContent]);

  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      syncFromMarkdown(newMarkdown);
    },
    [syncFromMarkdown]
  );

  const handleRichTextUpdate = useCallback(
    (editor: Editor) => {
      syncFromRichText(editor);
    },
    [syncFromRichText]
  );

  const handleEditorReady = useCallback(
    (editor: Editor) => {
      setEditor(editor);
    },
    [setEditor]
  );

  // Compute ProseMirror content from AST or markdown
  const proseMirrorContent = useMemo(() => {
    if (ast) {
      return mdastToProseMirror(ast);
    }
    if (markdown) {
      const parsedAst = parseMarkdown(markdown);
      return mdastToProseMirror(parsedAst);
    }
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }, [ast, markdown]);

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <OutlinePanel outline={outline} onHeadingClick={scrollToHeading} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex items-center gap-3 text-sm text-gray-500">
            {isSaving && <span className="text-blue-500">Saving...</span>}
            {!isSaving && lastSaved && (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-hidden">
          {activeTab === 'markdown' ? (
            <MarkdownEditor
              value={markdown}
              onChange={handleMarkdownChange}
              className="h-full"
            />
          ) : (
            <RichTextEditor
              content={proseMirrorContent}
              onUpdate={handleRichTextUpdate}
              onEditorReady={handleEditorReady}
              className="h-full"
            />
          )}
        </div>
      </div>

      {hasConflict && <ConflictModal onResolve={resolveConflict} />}
    </div>
  );
}
