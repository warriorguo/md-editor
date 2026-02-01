import type { Root, Content } from 'mdast';

export type { Root, Content };

export interface HeadingNode {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: HeadingNode[];
}

export interface OutlineData {
  headings: HeadingNode[];
}

export type SyncSource = 'markdown' | 'richtext';
