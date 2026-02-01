import type { Root, HeadingNode, OutlineData } from './types';

let headingCounter = 0;

function generateHeadingId(): string {
  return `heading-${++headingCounter}`;
}

function getHeadingText(children: unknown[]): string {
  return children
    .map((child) => {
      if (typeof child === 'object' && child !== null) {
        const node = child as { type?: string; value?: string; children?: unknown[] };
        if (node.type === 'text' && node.value) {
          return node.value;
        }
        if (node.children) {
          return getHeadingText(node.children);
        }
      }
      return '';
    })
    .join('');
}

export function extractOutline(ast: Root): OutlineData {
  const headings: HeadingNode[] = [];
  const stack: { level: number; node: HeadingNode }[] = [];

  for (const node of ast.children) {
    if (node.type === 'heading' && node.depth <= 3) {
      const heading: HeadingNode = {
        id: generateHeadingId(),
        text: getHeadingText(node.children),
        level: node.depth as 1 | 2 | 3,
        children: [],
      };

      // Find parent based on level
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        headings.push(heading);
      } else {
        stack[stack.length - 1].node.children.push(heading);
      }

      stack.push({ level: heading.level, node: heading });
    }
  }

  return { headings };
}

export function resetHeadingCounter(): void {
  headingCounter = 0;
}
