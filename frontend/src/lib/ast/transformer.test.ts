import { describe, it, expect } from 'vitest';
import { mdastToProseMirror, proseMirrorToMdast } from './transformer';
import type { Root, Paragraph, Heading, List, ListItem, Code, Blockquote, ThematicBreak, Text, Strong, Emphasis } from 'mdast';

describe('mdastToProseMirror', () => {
  it('should convert empty AST to doc with empty paragraph', () => {
    const ast: Root = { type: 'root', children: [] };
    const doc = mdastToProseMirror(ast);

    expect(doc.type).toBe('doc');
    expect(doc.content).toHaveLength(1);
    expect(doc.content![0].type).toBe('paragraph');
  });

  it('should convert paragraph', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Hello' } as Text],
        } as Paragraph,
      ],
    };
    const doc = mdastToProseMirror(ast);

    expect(doc.content).toHaveLength(1);
    expect(doc.content![0].type).toBe('paragraph');
    expect(doc.content![0].content![0].text).toBe('Hello');
  });

  it('should convert heading', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 2,
          children: [{ type: 'text', value: 'Title' } as Text],
        } as Heading,
      ],
    };
    const doc = mdastToProseMirror(ast);

    expect(doc.content![0].type).toBe('heading');
    expect(doc.content![0].attrs?.level).toBe(2);
  });

  it('should convert bullet list', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'list',
          ordered: false,
          spread: false,
          children: [
            {
              type: 'listItem',
              spread: false,
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'Item' } as Text],
                } as Paragraph,
              ],
            } as ListItem,
          ],
        } as List,
      ],
    };
    const doc = mdastToProseMirror(ast);

    expect(doc.content![0].type).toBe('bulletList');
  });

  it('should convert ordered list', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'list',
          ordered: true,
          spread: false,
          start: 1,
          children: [
            {
              type: 'listItem',
              spread: false,
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'Item' } as Text],
                } as Paragraph,
              ],
            } as ListItem,
          ],
        } as List,
      ],
    };
    const doc = mdastToProseMirror(ast);

    expect(doc.content![0].type).toBe('orderedList');
  });

  it('should convert code block', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'typescript',
          value: 'const x = 1;',
        } as Code,
      ],
    };
    const doc = mdastToProseMirror(ast);

    expect(doc.content![0].type).toBe('codeBlock');
    expect(doc.content![0].attrs?.language).toBe('typescript');
  });

  it('should convert blockquote', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'Quote' } as Text],
            } as Paragraph,
          ],
        } as Blockquote,
      ],
    };
    const doc = mdastToProseMirror(ast);

    expect(doc.content![0].type).toBe('blockquote');
  });

  it('should convert thematic break', () => {
    const ast: Root = {
      type: 'root',
      children: [{ type: 'thematicBreak' } as ThematicBreak],
    };
    const doc = mdastToProseMirror(ast);

    expect(doc.content![0].type).toBe('horizontalRule');
  });

  it('should convert strong text to bold mark', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'strong', children: [{ type: 'text', value: 'bold' } as Text] } as Strong,
          ],
        } as Paragraph,
      ],
    };
    const doc = mdastToProseMirror(ast);

    const textNode = doc.content![0].content![0];
    expect(textNode.marks).toBeDefined();
    expect(textNode.marks!.some(m => m.type === 'bold')).toBe(true);
  });

  it('should convert emphasis to italic mark', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'emphasis', children: [{ type: 'text', value: 'italic' } as Text] } as Emphasis,
          ],
        } as Paragraph,
      ],
    };
    const doc = mdastToProseMirror(ast);

    const textNode = doc.content![0].content![0];
    expect(textNode.marks!.some(m => m.type === 'italic')).toBe(true);
  });
});

describe('proseMirrorToMdast', () => {
  it('should convert empty doc', () => {
    const doc = { type: 'doc', content: [] };
    const ast = proseMirrorToMdast(doc);

    expect(ast.type).toBe('root');
    expect(ast.children).toHaveLength(0);
  });

  it('should convert paragraph', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello' }],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('paragraph');
  });

  it('should convert heading', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Title' }],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    expect(ast.children[0].type).toBe('heading');
    if (ast.children[0].type === 'heading') {
      expect(ast.children[0].depth).toBe(2);
    }
  });

  it('should convert bulletList', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item' }],
                },
              ],
            },
          ],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    expect(ast.children[0].type).toBe('list');
    if (ast.children[0].type === 'list') {
      expect(ast.children[0].ordered).toBe(false);
    }
  });

  it('should convert orderedList', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Item' }],
                },
              ],
            },
          ],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    expect(ast.children[0].type).toBe('list');
    if (ast.children[0].type === 'list') {
      expect(ast.children[0].ordered).toBe(true);
    }
  });

  it('should convert codeBlock', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          attrs: { language: 'js' },
          content: [{ type: 'text', text: 'const x = 1;' }],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    expect(ast.children[0].type).toBe('code');
    if (ast.children[0].type === 'code') {
      expect(ast.children[0].lang).toBe('js');
      expect(ast.children[0].value).toBe('const x = 1;');
    }
  });

  it('should convert bold mark to strong', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'bold',
              marks: [{ type: 'bold' }],
            },
          ],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    if (ast.children[0].type === 'paragraph') {
      expect(ast.children[0].children[0].type).toBe('strong');
    }
  });

  it('should convert italic mark to emphasis', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'italic',
              marks: [{ type: 'italic' }],
            },
          ],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    if (ast.children[0].type === 'paragraph') {
      expect(ast.children[0].children[0].type).toBe('emphasis');
    }
  });

  it('should convert code mark to inlineCode', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'code',
              marks: [{ type: 'code' }],
            },
          ],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    if (ast.children[0].type === 'paragraph') {
      expect(ast.children[0].children[0].type).toBe('inlineCode');
    }
  });

  it('should convert link mark to link node', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example',
              marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
            },
          ],
        },
      ],
    };
    const ast = proseMirrorToMdast(doc);

    if (ast.children[0].type === 'paragraph') {
      const linkNode = ast.children[0].children[0];
      expect(linkNode.type).toBe('link');
      if (linkNode.type === 'link') {
        expect(linkNode.url).toBe('https://example.com');
      }
    }
  });
});

describe('round-trip conversion', () => {
  it('should preserve basic structure through round-trip', () => {
    const originalAst: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'Title' } as Text],
        } as Heading,
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Some text' } as Text],
        } as Paragraph,
      ],
    };

    const proseMirror = mdastToProseMirror(originalAst);
    const roundTripAst = proseMirrorToMdast(proseMirror);

    expect(roundTripAst.children).toHaveLength(2);
    expect(roundTripAst.children[0].type).toBe('heading');
    expect(roundTripAst.children[1].type).toBe('paragraph');
  });
});
