import { useMemo, useCallback } from 'react';
import type { Root, OutlineData } from '../lib/ast/types';
import { extractOutline, resetHeadingCounter } from '../lib/ast/outline';

interface UseOutlineOptions {
  ast: Root | null;
}

interface UseOutlineReturn {
  outline: OutlineData;
  scrollToHeading: (id: string) => void;
}

export function useOutline({ ast }: UseOutlineOptions): UseOutlineReturn {
  const outline = useMemo(() => {
    if (!ast) {
      return { headings: [] };
    }

    resetHeadingCounter();
    return extractOutline(ast);
  }, [ast]);

  const scrollToHeading = useCallback((id: string) => {
    // Update URL hash
    window.history.pushState(null, '', `#${id}`);

    // Find the heading in the editor and scroll to it
    const headingElement = document.querySelector(`[data-heading-id="${id}"]`);
    if (headingElement) {
      headingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: try to find by text content in the rich text editor
      const index = parseInt(id.replace('heading-', ''), 10) - 1;
      const headings = document.querySelectorAll('.tiptap h1, .tiptap h2, .tiptap h3');
      if (headings[index]) {
        headings[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return {
    outline,
    scrollToHeading,
  };
}
