import { useState } from 'react';
import type { HeadingNode } from '../../lib/ast/types';

interface OutlineItemProps {
  heading: HeadingNode;
  onClick: (id: string) => void;
  depth?: number;
  defaultExpanded?: boolean;
}

export function OutlineItem({
  heading,
  onClick,
  depth = 0,
  defaultExpanded = false
}: OutlineItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = heading.children.length > 0;
  const paddingLeft = depth * 12 + 8;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        className="flex items-center group"
        style={{ paddingLeft }}
      >
        {hasChildren ? (
          <button
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={handleToggle}
          >
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}
        <button
          className="flex-1 text-left outline-item text-sm text-gray-700 truncate"
          onClick={() => onClick(heading.id)}
          title={heading.text}
        >
          {heading.text || '(empty heading)'}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {heading.children.map((child) => (
            <OutlineItem
              key={child.id}
              heading={child}
              onClick={onClick}
              depth={depth + 1}
              defaultExpanded={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
