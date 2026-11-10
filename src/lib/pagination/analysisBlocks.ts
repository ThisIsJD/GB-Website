import type { Heading, Paragraph, PhrasingContent } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';

const markdown = unified().use(remarkParse).use(remarkStringify);
export type AnalysisNode = Heading | Paragraph;
export interface AnalysisBlock {
  id: string;
  anchor: string;
  node: AnalysisNode;
  text: string;
}
export interface BlockFragment {
  blockId: string;
  anchor: string;
  from: number;
  to: number;
  node: AnalysisNode;
}
export interface ReadingLocation {
  anchor: string;
  blockId?: string;
  offset?: number;
}

export function inlineText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text' || node.type === 'inlineCode') return node.value;
      if (node.type === 'break') return '\n';
      if (
        node.type === 'strong' ||
        node.type === 'emphasis' ||
        node.type === 'link'
      )
        return inlineText(node.children);
      throw new Error(`Unsupported analysis inline content: ${node.type}`);
    })
    .join('');
}

export function analysisBlocks(source: string): AnalysisBlock[] {
  let anchor = 'introduction';
  return markdown.parse(source).children.map((node, index) => {
    if (node.type !== 'heading' && node.type !== 'paragraph')
      throw new Error(`Unsupported analysis block: ${node.type}`);
    const text = inlineText(node.children);
    if (node.type === 'heading') {
      const number = /^(\d+)\./u.exec(text)?.[1];
      anchor = number ? `answer-${number}` : `section-${index}`;
    }
    return { id: `block-${index}`, anchor, node, text };
  });
}

// Slice Unicode code points, including nested emphasis and complete link targets.
// Source ranges include boundary whitespace, even when Markdown trims it visually.
function sliceInline(
  nodes: PhrasingContent[],
  from: number,
  to: number,
): PhrasingContent[] {
  let cursor = 0;
  return nodes.flatMap((node): PhrasingContent[] => {
    const length = Array.from(inlineText([node])).length;
    const start = Math.max(0, from - cursor);
    const end = Math.min(length, to - cursor);
    cursor += length;
    if (start >= end) return [];
    if (node.type === 'text' || node.type === 'inlineCode')
      return [
        { ...node, value: Array.from(node.value).slice(start, end).join('') },
      ];
    if (node.type === 'break') return [node];
    if (
      node.type === 'strong' ||
      node.type === 'emphasis' ||
      node.type === 'link'
    )
      return [{ ...node, children: sliceInline(node.children, start, end) }];
    throw new Error(`Unsupported analysis inline content: ${node.type}`);
  });
}

export function fragment(
  block: AnalysisBlock,
  from = 0,
  to = Array.from(block.text).length,
): BlockFragment {
  return {
    blockId: block.id,
    anchor: block.anchor,
    from,
    to,
    node: {
      ...block.node,
      children: sliceInline(block.node.children, from, to),
    },
  };
}

export function fragmentMarkdown(fragments: BlockFragment[]): string {
  return markdown.stringify({
    type: 'root',
    children: fragments.map((part) => part.node),
  });
}

export function wordBoundary(
  text: string,
  from: number,
  limit: number,
): number {
  const points = Array.from(text);
  // Prefer a word boundary, but allow progress through an unbroken URL or word.
  for (let end = limit; end > from + Math.floor((limit - from) / 2); end--)
    if (/\s/u.test(points[end - 1] ?? '')) return end;
  return limit;
}
