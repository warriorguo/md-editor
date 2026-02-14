import type { JSONContent } from '@tiptap/react';
import type {
  Root,
  Heading,
  Paragraph,
  Blockquote,
  List,
  ListItem,
  Code,
  ThematicBreak,
  Text,
  Strong,
  Emphasis,
  InlineCode,
  Link,
  PhrasingContent,
  BlockContent,
  RootContent,
} from 'mdast';

type MdastNode = RootContent;

/**
 * Convert MDAST to ProseMirror/Tiptap JSON
 */
export function mdastToProseMirror(ast: Root): JSONContent {
  const content = ast.children.map(convertNode).filter(Boolean) as JSONContent[];

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  };
}

function convertNode(node: MdastNode): JSONContent | null {
  switch (node.type) {
    case 'heading':
      return {
        type: 'heading',
        attrs: { level: node.depth },
        content: convertInlineContent(node.children),
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        content: convertInlineContent(node.children),
      };

    case 'blockquote':
      return {
        type: 'blockquote',
        content: node.children.map(convertNode).filter(Boolean) as JSONContent[],
      };

    case 'list':
      return {
        type: node.ordered ? 'orderedList' : 'bulletList',
        content: node.children.map(convertNode).filter(Boolean) as JSONContent[],
      };

    case 'listItem':
      return {
        type: 'listItem',
        content: node.children.map(convertNode).filter(Boolean) as JSONContent[],
      };

    case 'code':
      return {
        type: 'codeBlock',
        attrs: { language: node.lang || null },
        content: node.value ? [{ type: 'text', text: node.value }] : undefined,
      };

    case 'thematicBreak':
      return { type: 'horizontalRule' };

    default:
      return null;
  }
}

function convertInlineContent(children: PhrasingContent[]): JSONContent[] {
  const result: JSONContent[] = [];

  for (const child of children) {
    const converted = convertInlineNode(child);
    if (converted) {
      result.push(converted);
    }
  }

  return result;
}

function convertInlineNode(node: PhrasingContent): JSONContent | null {
  switch (node.type) {
    case 'text':
      if (!node.value) return null;
      return { type: 'text', text: node.value };

    case 'strong': {
      const text = getTextContent(node.children);
      if (!text) return null;
      return { type: 'text', marks: [{ type: 'bold' }], text };
    }

    case 'emphasis': {
      const text = getTextContent(node.children);
      if (!text) return null;
      return { type: 'text', marks: [{ type: 'italic' }], text };
    }

    case 'inlineCode':
      if (!node.value) return null;
      return { type: 'text', marks: [{ type: 'code' }], text: node.value };

    case 'link': {
      const text = getTextContent(node.children);
      if (!text) return null;
      return {
        type: 'text',
        marks: [{ type: 'link', attrs: { href: node.url, target: '_blank' } }],
        text,
      };
    }

    default:
      return null;
  }
}

function getTextContent(children: PhrasingContent[]): string {
  return children
    .map((child) => {
      if (child.type === 'text') return child.value;
      if ('children' in child) return getTextContent(child.children as PhrasingContent[]);
      return '';
    })
    .join('');
}

/**
 * Convert ProseMirror/Tiptap JSON to MDAST
 */
export function proseMirrorToMdast(doc: JSONContent): Root {
  const children = (doc.content || [])
    .map(convertPMNode)
    .filter((n): n is RootContent => n !== null);

  return {
    type: 'root',
    children,
  };
}

function convertPMNode(node: JSONContent): RootContent | null {
  switch (node.type) {
    case 'heading': {
      const heading: Heading = {
        type: 'heading',
        depth: (node.attrs?.level || 1) as 1 | 2 | 3 | 4 | 5 | 6,
        children: convertPMInlineContent(node.content || []),
      };
      return heading;
    }

    case 'paragraph': {
      const paragraph: Paragraph = {
        type: 'paragraph',
        children: convertPMInlineContent(node.content || []),
      };
      return paragraph;
    }

    case 'blockquote': {
      const blockquote: Blockquote = {
        type: 'blockquote',
        children: (node.content || [])
          .map(convertPMNode)
          .filter((n): n is BlockContent => n !== null && isBlockContent(n)),
      };
      return blockquote;
    }

    case 'bulletList': {
      const list: List = {
        type: 'list',
        ordered: false,
        spread: false,
        children: (node.content || [])
          .map(convertPMNode)
          .filter((n): n is ListItem => n !== null && n.type === 'listItem'),
      };
      return list;
    }

    case 'orderedList': {
      const list: List = {
        type: 'list',
        ordered: true,
        spread: false,
        start: 1,
        children: (node.content || [])
          .map(convertPMNode)
          .filter((n): n is ListItem => n !== null && n.type === 'listItem'),
      };
      return list;
    }

    case 'listItem': {
      const listItem: ListItem = {
        type: 'listItem',
        spread: false,
        children: (node.content || [])
          .map(convertPMNode)
          .filter((n): n is BlockContent => n !== null && isBlockContent(n)),
      };
      return listItem;
    }

    case 'codeBlock': {
      const code: Code = {
        type: 'code',
        lang: node.attrs?.language || undefined,
        value: getNodeText(node),
      };
      return code;
    }

    case 'horizontalRule': {
      const rule: ThematicBreak = { type: 'thematicBreak' };
      return rule;
    }

    default:
      return null;
  }
}

function isBlockContent(node: RootContent): node is BlockContent {
  return ['paragraph', 'heading', 'blockquote', 'list', 'code', 'thematicBreak'].includes(node.type);
}

function convertPMInlineContent(content: JSONContent[]): PhrasingContent[] {
  const result: PhrasingContent[] = [];

  for (const node of content) {
    if (node.type === 'text') {
      const text = node.text || '';
      const marks = node.marks || [];

      if (marks.length === 0) {
        const textNode: Text = { type: 'text', value: text };
        result.push(textNode);
      } else {
        let current: PhrasingContent = { type: 'text', value: text };

        for (const mark of marks) {
          if (mark.type === 'bold') {
            const strong: Strong = { type: 'strong', children: [current] };
            current = strong;
          } else if (mark.type === 'italic') {
            const emphasis: Emphasis = { type: 'emphasis', children: [current] };
            current = emphasis;
          } else if (mark.type === 'code') {
            const inlineCode: InlineCode = { type: 'inlineCode', value: text };
            current = inlineCode;
          } else if (mark.type === 'link') {
            const link: Link = {
              type: 'link',
              url: mark.attrs?.href || '',
              children: [{ type: 'text', value: text }],
            };
            current = link;
          }
        }

        result.push(current);
      }
    }
  }

  return result;
}

function getNodeText(node: JSONContent): string {
  if (node.text) return node.text;
  if (node.content) {
    return node.content.map(getNodeText).join('');
  }
  return '';
}
