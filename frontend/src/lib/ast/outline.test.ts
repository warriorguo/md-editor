import { describe, it, expect, beforeEach } from 'vitest';
import { extractOutline, resetHeadingCounter } from './outline';
import type { Root, Heading, Paragraph, Text } from 'mdast';

describe('extractOutline', () => {
  beforeEach(() => {
    resetHeadingCounter();
  });

  it('should return empty outline for empty AST', () => {
    const ast: Root = { type: 'root', children: [] };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(0);
  });

  it('should return empty outline for AST without headings', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'Just text' } as Text],
        } as Paragraph,
      ],
    };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(0);
  });

  it('should extract h1 heading', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'Main Title' } as Text],
        } as Heading,
      ],
    };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(1);
    expect(outline.headings[0].text).toBe('Main Title');
    expect(outline.headings[0].level).toBe(1);
    expect(outline.headings[0].id).toBe('heading-1');
  });

  it('should extract h1, h2, and h3 headings', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'H1' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 2,
          children: [{ type: 'text', value: 'H2' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 3,
          children: [{ type: 'text', value: 'H3' } as Text],
        } as Heading,
      ],
    };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(1); // h1 at root
    expect(outline.headings[0].children).toHaveLength(1); // h2 nested under h1
    expect(outline.headings[0].children[0].children).toHaveLength(1); // h3 nested under h2
  });

  it('should ignore h4 and deeper headings', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 4,
          children: [{ type: 'text', value: 'H4' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 5,
          children: [{ type: 'text', value: 'H5' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 6,
          children: [{ type: 'text', value: 'H6' } as Text],
        } as Heading,
      ],
    };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(0);
  });

  it('should create flat structure for multiple h1s', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'First H1' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'Second H1' } as Text],
        } as Heading,
      ],
    };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(2);
    expect(outline.headings[0].text).toBe('First H1');
    expect(outline.headings[1].text).toBe('Second H1');
  });

  it('should nest h2 under preceding h1', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'Chapter 1' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 2,
          children: [{ type: 'text', value: 'Section 1.1' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 2,
          children: [{ type: 'text', value: 'Section 1.2' } as Text],
        } as Heading,
      ],
    };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(1);
    expect(outline.headings[0].children).toHaveLength(2);
    expect(outline.headings[0].children[0].text).toBe('Section 1.1');
    expect(outline.headings[0].children[1].text).toBe('Section 1.2');
  });

  it('should handle h2 without preceding h1', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 2,
          children: [{ type: 'text', value: 'Orphan H2' } as Text],
        } as Heading,
      ],
    };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(1);
    expect(outline.headings[0].text).toBe('Orphan H2');
    expect(outline.headings[0].level).toBe(2);
  });

  it('should generate unique IDs for each heading', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'First' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'Second' } as Text],
        } as Heading,
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'Third' } as Text],
        } as Heading,
      ],
    };
    const outline = extractOutline(ast);

    const ids = outline.headings.map(h => h.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should handle empty heading text', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [],
        } as Heading,
      ],
    };
    const outline = extractOutline(ast);

    expect(outline.headings).toHaveLength(1);
    expect(outline.headings[0].text).toBe('');
  });
});

describe('resetHeadingCounter', () => {
  it('should reset the heading counter', () => {
    const ast: Root = {
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{ type: 'text', value: 'Test' } as Text],
        } as Heading,
      ],
    };

    // Reset counter before test
    resetHeadingCounter();

    // First extraction
    const outline1 = extractOutline(ast);
    expect(outline1.headings[0].id).toBe('heading-1');

    // Without reset, counter continues
    const outline2 = extractOutline(ast);
    expect(outline2.headings[0].id).toBe('heading-2');

    // After reset, counter starts from 1
    resetHeadingCounter();
    const outline3 = extractOutline(ast);
    expect(outline3.headings[0].id).toBe('heading-1');
  });
});
