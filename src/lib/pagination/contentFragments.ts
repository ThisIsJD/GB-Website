import type { Nodes } from 'mdast';
import { nodeText, blocksMarkdown } from '../content/parseMarkdown';
import type { ContentBlock, ContentNode } from '../content/types';

export interface ContentFragment {
  blockId: string;
  documentId: string;
  anchor: string;
  role: ContentBlock['role'];
  from: number;
  to: number;
  /** Original source range, including whitespace between structural children. */
  text: string;
  node: ContentNode;
}

const structural = new Set(['root', 'list', 'listItem', 'blockquote']);
const length = (node: Nodes) => Array.from(nodeText(node)).length;

/** Atomic image ranges and useful whole-item/paragraph boundaries in source order. */
function boundaries(
  node: Nodes,
  start = 0,
): { atoms: [number, number][]; preferred: number[] } {
  if (node.type === 'image')
    return { atoms: [[start, start + length(node)]], preferred: [] };
  const result: ReturnType<typeof boundaries> = { atoms: [], preferred: [] };
  if (!('children' in node)) return result;
  let cursor = start;
  for (const [index, child] of node.children.entries()) {
    const nested = boundaries(child, cursor);
    result.atoms.push(...nested.atoms);
    result.preferred.push(...nested.preferred);
    cursor += length(child);
    if (structural.has(node.type) && index < node.children.length - 1) cursor++;
    if (node.type === 'list' || node.type === 'blockquote')
      result.preferred.push(cursor);
  }
  return result;
}

export function atomicEnd(block: ContentBlock, limit: number): number {
  for (const [from, to] of boundaries(block.node).atoms)
    if (limit > from && limit < to) return from;
  return limit;
}

export function minimumEnd(block: ContentBlock, limit: number): number {
  for (const [from, to] of boundaries(block.node).atoms)
    if (limit > from && limit < to) return to;
  return limit;
}

function includeStructuralSeparator(block: ContentBlock, end: number): number {
  const points = Array.from(block.text);
  const preferred = new Set(boundaries(block.node).preferred);
  // The separator is part of the source range but adds no rendered child.
  while (points[end] === '\n' && preferred.has(end + 1)) end++;
  return end;
}

export function preferredEnd(
  block: ContentBlock,
  from: number,
  limit: number,
): number {
  const boundary = boundaries(block.node)
    .preferred.filter((end) => end > from && end <= limit)
    .at(-1);
  if (boundary !== undefined)
    return includeStructuralSeparator(block, atomicEnd(block, boundary));
  const points = Array.from(block.text);
  for (let end = limit; end > from + Math.floor((limit - from) / 2); end--)
    if (/\s/u.test(points[end - 1] ?? ''))
      return includeStructuralSeparator(block, atomicEnd(block, end));
  return includeStructuralSeparator(block, atomicEnd(block, limit));
}

function sliceNode(node: Nodes, from: number, to: number): Nodes | null {
  if (from >= to) return null;
  if (node.type === 'text' || node.type === 'inlineCode')
    return { ...node, value: Array.from(node.value).slice(from, to).join('') };
  if (node.type === 'image' || node.type === 'break') return node;
  if (!('children' in node)) throw new Error(`Cannot split ${node.type}`);
  let cursor = 0;
  let firstChild = -1;
  const children = node.children.flatMap((child, index) => {
    const size = length(child);
    const start = Math.max(0, from - cursor);
    const end = Math.min(size, to - cursor);
    cursor += size + (structural.has(node.type) ? 1 : 0);
    if (start >= end) return [];
    const part = sliceNode(child, start, end);
    if (!part) return [];
    if (firstChild < 0) firstChild = index;
    return [part];
  });
  if (!children.length) return null;
  return {
    ...node,
    ...(node.type === 'list' && node.ordered
      ? { start: (node.start ?? 1) + firstChild }
      : {}),
    children,
  } as Nodes;
}

export function contentFragment(
  block: ContentBlock,
  from = 0,
  to = Array.from(block.text).length,
): ContentFragment {
  const size = Array.from(block.text).length;
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to > size ||
    to <= from
  )
    throw new Error(`Invalid source range in ${block.id}: ${from}..${to}`);
  if (atomicEnd(block, from) !== from || atomicEnd(block, to) !== to)
    throw new Error(`Cannot split an image in ${block.id}`);
  const node =
    from === 0 && to === size ? block.node : sliceNode(block.node, from, to);
  if (!node)
    throw new Error(`Source range has no renderable content in ${block.id}`);
  return {
    blockId: block.id,
    documentId: block.documentId,
    anchor: block.anchor,
    role: block.role,
    from,
    to,
    text: Array.from(block.text).slice(from, to).join(''),
    node: node as ContentNode,
  };
}

export function contentMarkdown(parts: readonly ContentFragment[]): string {
  return blocksMarkdown(parts);
}
