import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './parser';

describe('parseMarkdown', () => {
  it('should parse empty string', () => {
    const ast = parseMarkdown('');
    expect(ast.type).toBe('root');
    expect(ast.children).toHaveLength(0);
  });

  it('should parse a paragraph', () => {
    const ast = parseMarkdown('Hello world');
    expect(ast.type).toBe('root');
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('paragraph');
  });

  it('should parse headings', () => {
    const ast = parseMarkdown('# Heading 1\n\n## Heading 2\n\n### Heading 3');
    expect(ast.children).toHaveLength(3);

    const h1 = ast.children[0];
    const h2 = ast.children[1];
    const h3 = ast.children[2];

    expect(h1.type).toBe('heading');
    expect(h2.type).toBe('heading');
    expect(h3.type).toBe('heading');

    if (h1.type === 'heading') expect(h1.depth).toBe(1);
    if (h2.type === 'heading') expect(h2.depth).toBe(2);
    if (h3.type === 'heading') expect(h3.depth).toBe(3);
  });

  it('should parse bullet list', () => {
    const ast = parseMarkdown('- Item 1\n- Item 2\n- Item 3');
    expect(ast.children).toHaveLength(1);

    const list = ast.children[0];
    expect(list.type).toBe('list');
    if (list.type === 'list') {
      expect(list.ordered).toBe(false);
      expect(list.children).toHaveLength(3);
    }
  });

  it('should parse ordered list', () => {
    const ast = parseMarkdown('1. First\n2. Second\n3. Third');
    expect(ast.children).toHaveLength(1);

    const list = ast.children[0];
    expect(list.type).toBe('list');
    if (list.type === 'list') {
      expect(list.ordered).toBe(true);
      expect(list.children).toHaveLength(3);
    }
  });

  it('should parse code block', () => {
    const ast = parseMarkdown('```javascript\nconst x = 1;\n```');
    expect(ast.children).toHaveLength(1);

    const code = ast.children[0];
    expect(code.type).toBe('code');
    if (code.type === 'code') {
      expect(code.lang).toBe('javascript');
      expect(code.value).toBe('const x = 1;');
    }
  });

  it('should parse blockquote', () => {
    const ast = parseMarkdown('> This is a quote');
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('blockquote');
  });

  it('should parse inline emphasis', () => {
    const ast = parseMarkdown('This is _italic_ and *also italic*');
    expect(ast.children).toHaveLength(1);

    const para = ast.children[0];
    if (para.type === 'paragraph') {
      const hasEmphasis = para.children.some(child => child.type === 'emphasis');
      expect(hasEmphasis).toBe(true);
    }
  });

  it('should parse inline strong', () => {
    const ast = parseMarkdown('This is **bold** and __also bold__');
    expect(ast.children).toHaveLength(1);

    const para = ast.children[0];
    if (para.type === 'paragraph') {
      const hasStrong = para.children.some(child => child.type === 'strong');
      expect(hasStrong).toBe(true);
    }
  });

  it('should parse inline code', () => {
    const ast = parseMarkdown('Use `const` for constants');
    expect(ast.children).toHaveLength(1);

    const para = ast.children[0];
    if (para.type === 'paragraph') {
      const hasInlineCode = para.children.some(child => child.type === 'inlineCode');
      expect(hasInlineCode).toBe(true);
    }
  });

  it('should parse links', () => {
    const ast = parseMarkdown('Click [here](https://example.com)');
    expect(ast.children).toHaveLength(1);

    const para = ast.children[0];
    if (para.type === 'paragraph') {
      const hasLink = para.children.some(child => child.type === 'link');
      expect(hasLink).toBe(true);
    }
  });

  it('should parse thematic break', () => {
    const ast = parseMarkdown('Above\n\n---\n\nBelow');
    const hasThematicBreak = ast.children.some(child => child.type === 'thematicBreak');
    expect(hasThematicBreak).toBe(true);
  });
});
