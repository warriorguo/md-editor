import type { OutlineData } from '../../lib/ast/types';
import { OutlineItem } from './OutlineItem';

interface OutlinePanelProps {
  outline: OutlineData;
  onHeadingClick: (id: string) => void;
}

export function OutlinePanel({ outline, onHeadingClick }: OutlinePanelProps) {
  if (outline.headings.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Outline</h3>
        <p className="text-sm text-gray-400">
          No headings found. Add h1, h2, or h3 headings to see the outline.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Outline</h3>
      <nav className="space-y-1">
        {outline.headings.map((heading) => (
          <OutlineItem
            key={heading.id}
            heading={heading}
            onClick={onHeadingClick}
          />
        ))}
      </nav>
    </div>
  );
}
