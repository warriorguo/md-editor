import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import type { Root } from './types';

const serializer = unified().use(remarkGfm).use(remarkStringify, {
  bullet: '-',
  emphasis: '_',
  strong: '*',
  fence: '`',
  fences: true,
  listItemIndent: 'one',
});

export function serializeToMarkdown(ast: Root): string {
  return serializer.stringify(ast);
}
