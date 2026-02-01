import { describe, it, expect, beforeEach } from 'vitest';
import { useDocumentStore } from './documentStore';

describe('documentStore', () => {
  beforeEach(() => {
    useDocumentStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useDocumentStore.getState();

      expect(state.document).toBeNull();
      expect(state.ast).toBeNull();
      expect(state.markdown).toBe('');
      expect(state.version).toBe(0);
      expect(state.isDirty).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.lastSaved).toBeNull();
      expect(state.hasConflict).toBe(false);
    });
  });

  describe('setDocument', () => {
    it('should set document and update related state', () => {
      const doc = {
        id: 'doc-1',
        projectId: 'project-1',
        contentMd: '# Hello',
        version: 5,
        updatedAt: '2024-01-01T00:00:00Z',
      };

      useDocumentStore.getState().setDocument(doc);

      const state = useDocumentStore.getState();
      expect(state.document).toEqual(doc);
      expect(state.markdown).toBe('# Hello');
      expect(state.version).toBe(5);
      expect(state.isDirty).toBe(false);
    });
  });

  describe('setAst', () => {
    it('should set AST', () => {
      const ast = { type: 'root' as const, children: [] };

      useDocumentStore.getState().setAst(ast);

      expect(useDocumentStore.getState().ast).toEqual(ast);
    });
  });

  describe('setMarkdown', () => {
    it('should set markdown and mark as dirty', () => {
      useDocumentStore.getState().setMarkdown('# New content');

      const state = useDocumentStore.getState();
      expect(state.markdown).toBe('# New content');
      expect(state.isDirty).toBe(true);
    });
  });

  describe('setVersion', () => {
    it('should update version', () => {
      useDocumentStore.getState().setVersion(10);

      expect(useDocumentStore.getState().version).toBe(10);
    });
  });

  describe('setIsDirty', () => {
    it('should update isDirty flag', () => {
      useDocumentStore.getState().setIsDirty(true);
      expect(useDocumentStore.getState().isDirty).toBe(true);

      useDocumentStore.getState().setIsDirty(false);
      expect(useDocumentStore.getState().isDirty).toBe(false);
    });
  });

  describe('setIsSaving', () => {
    it('should update isSaving flag', () => {
      useDocumentStore.getState().setIsSaving(true);
      expect(useDocumentStore.getState().isSaving).toBe(true);

      useDocumentStore.getState().setIsSaving(false);
      expect(useDocumentStore.getState().isSaving).toBe(false);
    });
  });

  describe('setLastSaved', () => {
    it('should update lastSaved and clear isDirty', () => {
      useDocumentStore.setState({ isDirty: true });
      const saveTime = new Date();

      useDocumentStore.getState().setLastSaved(saveTime);

      const state = useDocumentStore.getState();
      expect(state.lastSaved).toEqual(saveTime);
      expect(state.isDirty).toBe(false);
    });

    it('should handle null lastSaved', () => {
      useDocumentStore.setState({ lastSaved: new Date(), isDirty: true });

      useDocumentStore.getState().setLastSaved(null);

      const state = useDocumentStore.getState();
      expect(state.lastSaved).toBeNull();
      expect(state.isDirty).toBe(false);
    });
  });

  describe('setHasConflict', () => {
    it('should update hasConflict flag', () => {
      useDocumentStore.getState().setHasConflict(true);
      expect(useDocumentStore.getState().hasConflict).toBe(true);

      useDocumentStore.getState().setHasConflict(false);
      expect(useDocumentStore.getState().hasConflict).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      // Set some values
      useDocumentStore.setState({
        document: { id: '1', projectId: '1', contentMd: '', version: 1, updatedAt: '' },
        ast: { type: 'root', children: [] },
        markdown: '# Test',
        version: 5,
        isDirty: true,
        isSaving: true,
        lastSaved: new Date(),
        hasConflict: true,
      });

      // Reset
      useDocumentStore.getState().reset();

      // Verify initial state
      const state = useDocumentStore.getState();
      expect(state.document).toBeNull();
      expect(state.ast).toBeNull();
      expect(state.markdown).toBe('');
      expect(state.version).toBe(0);
      expect(state.isDirty).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.lastSaved).toBeNull();
      expect(state.hasConflict).toBe(false);
    });
  });
});
