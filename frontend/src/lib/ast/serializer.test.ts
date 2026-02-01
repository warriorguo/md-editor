import { describe, it, expect } from 'vitest';
import { serializeToMarkdown } from './serializer';
import type { Root, Paragraph, Heading, List, ListItem, Code, Blockquote, ThematicBreak, Strong, Emphasis, InlineCode, Link } from 'mdast';

describe('serializeToMarkdown', () => {
  it('should serialize empty root', () => {
    const ast: Root = { type: 'root', children: [] };
    const markdown = serializeToMarkdown(ast);
    expect(markdown.trim()).toBe('');
  });

  it('should serialize a paragraph', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Hello world' }],
        } as Paragraph,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown.trim()).toBe('Hello world');
  });

  it('should serialize headings', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'Title' }],
        } as Heading,
        {
          type: 'heading',
          depth: 2,
          children: [{ type: 'text', value: 'Subtitle' }],
        } as Heading,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('# Title');
    expect(markdown).toContain('## Subtitle');
  });

  it('should serialize bullet list', () => {
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
                  children: [{ type: 'text', value: 'Item 1' }],
                } as Paragraph,
              ],
            } as ListItem,
            {
              type: 'listItem',
              spread: false,
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'Item 2' }],
                } as Paragraph,
              ],
            } as ListItem,
          ],
        } as List,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('- Item 1');
    expect(markdown).toContain('- Item 2');
  });

  it('should serialize ordered list', () => {
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
                  children: [{ type: 'text', value: 'First' }],
                } as Paragraph,
              ],
            } as ListItem,
          ],
        } as List,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('1.');
    expect(markdown).toContain('First');
  });

  it('should serialize code block', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'javascript',
          value: 'const x = 1;',
        } as Code,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('```javascript');
    expect(markdown).toContain('const x = 1;');
    expect(markdown).toContain('```');
  });

  it('should serialize blockquote', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'A quote' }],
            } as Paragraph,
          ],
        } as Blockquote,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('> A quote');
  });

  it('should serialize thematic break', () => {
    const ast: Root = {
      type: 'root',
      children: [
        { type: 'thematicBreak' } as ThematicBreak,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    // remark-stringify uses *** for thematic breaks by default
    expect(markdown).toContain('***');
  });

  it('should serialize strong text', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'strong', children: [{ type: 'text', value: 'bold' }] } as Strong,
          ],
        } as Paragraph,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('**bold**');
  });

  it('should serialize emphasis text', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'emphasis', children: [{ type: 'text', value: 'italic' }] } as Emphasis,
          ],
        } as Paragraph,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('_italic_');
  });

  it('should serialize inline code', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'inlineCode', value: 'code' } as InlineCode,
          ],
        } as Paragraph,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('`code`');
  });

  it('should serialize link', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'https://example.com',
              children: [{ type: 'text', value: 'Example' }],
            } as Link,
          ],
        } as Paragraph,
      ],
    };
    const markdown = serializeToMarkdown(ast);
    expect(markdown).toContain('[Example](https://example.com)');
  });
});
