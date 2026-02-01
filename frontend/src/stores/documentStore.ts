import { create } from 'zustand';
import type { Root } from '../lib/ast/types';
import type { Document } from '../lib/api/documents';

interface DocumentState {
  document: Document | null;
  ast: Root | null;
  markdown: string;
  version: number;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasConflict: boolean;

  setDocument: (document: Document) => void;
  setAst: (ast: Root) => void;
  setMarkdown: (markdown: string) => void;
  setVersion: (version: number) => void;
  setIsDirty: (isDirty: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  setLastSaved: (lastSaved: Date | null) => void;
  setHasConflict: (hasConflict: boolean) => void;
  reset: () => void;
}

const initialState = {
  document: null,
  ast: null,
  markdown: '',
  version: 0,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  hasConflict: false,
};

export const useDocumentStore = create<DocumentState>((set) => ({
  ...initialState,

  setDocument: (document) =>
    set({
      document,
      markdown: document.contentMd,
      version: document.version,
      isDirty: false,
    }),

  setAst: (ast) => set({ ast }),

  setMarkdown: (markdown) => set({ markdown, isDirty: true }),

  setVersion: (version) => set({ version }),

  setIsDirty: (isDirty) => set({ isDirty }),

  setIsSaving: (isSaving) => set({ isSaving }),

  setLastSaved: (lastSaved) => set({ lastSaved, isDirty: false }),

  setHasConflict: (hasConflict) => set({ hasConflict }),

  reset: () => set(initialState),
}));
