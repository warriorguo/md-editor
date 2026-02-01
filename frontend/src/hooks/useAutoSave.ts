import { useCallback, useEffect, useRef, useState } from 'react';
import { updateDocument } from '../lib/api/documents';

interface UseAutoSaveOptions {
  documentId: string | null;
  version: number;
  debounceMs?: number;
  intervalMs?: number;
  onConflict?: () => void;
  onVersionUpdate?: (newVersion: number) => void;
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  save: (content: string) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  hasConflict: boolean;
  resolveConflict: (action: 'reload' | 'overwrite') => void;
}

export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn {
  const {
    documentId,
    version,
    debounceMs = 1000,
    intervalMs = 30000,
    onConflict,
    onVersionUpdate,
    onError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasConflict, setHasConflict] = useState(false);

  const pendingContentRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentVersionRef = useRef(version);

  // Keep version ref updated
  useEffect(() => {
    currentVersionRef.current = version;
  }, [version]);

  const performSave = useCallback(
    async (content: string) => {
      if (!documentId || isSaving) return;

      setIsSaving(true);

      try {
        const result = await updateDocument(
          documentId,
          { contentMd: content },
          currentVersionRef.current
        );

        if (result.conflict) {
          setHasConflict(true);
          onConflict?.();
        } else if (result.document) {
          currentVersionRef.current = result.document.version;
          onVersionUpdate?.(result.document.version);
          setLastSaved(new Date());
          pendingContentRef.current = null;
        }
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Save failed'));
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, isSaving, onConflict, onVersionUpdate, onError]
  );

  const save = useCallback(
    (content: string) => {
      pendingContentRef.current = content;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        if (pendingContentRef.current !== null) {
          performSave(pendingContentRef.current);
        }
      }, debounceMs);
    },
    [debounceMs, performSave]
  );

  // Interval backup save
  useEffect(() => {
    if (!documentId) return;

    intervalTimerRef.current = setInterval(() => {
      if (pendingContentRef.current !== null && !isSaving) {
        performSave(pendingContentRef.current);
      }
    }, intervalMs);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [documentId, intervalMs, isSaving, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, []);

  const resolveConflict = useCallback(
    (action: 'reload' | 'overwrite') => {
      setHasConflict(false);

      if (action === 'reload') {
        // Parent component should reload the document
        window.location.reload();
      } else if (action === 'overwrite' && pendingContentRef.current !== null) {
        // Force save by updating version first (parent needs to refetch)
        // For simplicity, reload to get latest version then save
        window.location.reload();
      }
    },
    []
  );

  return {
    save,
    isSaving,
    lastSaved,
    hasConflict,
    resolveConflict,
  };
}
