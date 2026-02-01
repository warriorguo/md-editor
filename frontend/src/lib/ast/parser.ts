import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root } from './types';

const parser = unified().use(remarkParse);

export function parseMarkdown(markdown: string): Root {
  return parser.parse(markdown) as Root;
}
