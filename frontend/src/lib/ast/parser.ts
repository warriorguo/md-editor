import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root } from './types';

const parser = unified().use(remarkParse).use(remarkGfm);

export function parseMarkdown(markdown: string): Root {
  return parser.parse(markdown) as Root;
}
