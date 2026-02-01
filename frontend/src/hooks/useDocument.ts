import { useState, useEffect, useCallback } from 'react';
import { getDocument, Document } from '../lib/api/documents';

interface UseDocumentOptions {
  projectId: string | null;
}

interface UseDocumentReturn {
  document: Document | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useDocument({ projectId }: UseDocumentOptions): UseDocumentReturn {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const doc = await getDocument(projectId);
      setDocument(doc);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load document'));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    document,
    isLoading,
    error,
    reload,
  };
}
