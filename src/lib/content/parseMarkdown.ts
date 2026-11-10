import type { Definition, Nodes, PhrasingContent, Root } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { answerKeys, ContentValidationError } from './types';
import type { ContentBlock, ContentNode } from './types';

const markdown = unified().use(remarkParse).use(remarkStringify);
const supported = new Set([
  'root',
  'heading',
  'paragraph',
  'list',
  'listItem',
  'blockquote',
  'text',
  'strong',
  'emphasis',
  'inlineCode',
  'break',
  'link',
  'image',
]);

export function isSafeContentUrl(url: string): boolean {
  if (
    Array.from(url).some(
      (point) =>
        point.codePointAt(0)! <= 32 || point === '\u007f' || point === '\\',
    )
  )
    return false;
  if (url.startsWith('#')) return url.length > 1;
  if (url.startsWith('/')) return !url.startsWith('//');
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** No raw HTML enters the canonical tree, including HTML inside inline nodes. */
function normalize(
  node: Nodes,
  definitions: Map<string, Definition>,
): Nodes | null {
  if (node.type === 'html' || node.type === 'definition') return null;
  if (node.type === 'linkReference' || node.type === 'imageReference') {
    const definition = definitions.get(node.identifier.toUpperCase());
    if (!definition)
      throw new Error(`Missing Markdown reference: ${node.identifier}`);
    return normalize(
      node.type === 'linkReference'
        ? {
            type: 'link',
            url: definition.url,
            title: definition.title,
            children: node.children,
          }
        : {
            type: 'image',
            url: definition.url,
            title: definition.title,
            alt: node.alt,
          },
      definitions,
    );
  }
  if (!supported.has(node.type))
    throw new Error(`Unsupported Markdown: ${node.type}`);
  if (
    (node.type === 'link' || node.type === 'image') &&
    !isSafeContentUrl(node.url)
  )
    throw new Error(`Unsafe or unsupported URL: ${node.url}`);
  if ('children' in node) {
    return {
      ...node,
      children: node.children.flatMap((child) => {
        const safe = normalize(child, definitions);
        return safe ? [safe] : [];
      }),
    } as Nodes;
  }
  return node;
}

/** Deterministic identity, independent of source positions and layout geometry. */
function contentHash(node: ContentNode): string {
  const value = JSON.stringify(node, (key, item) =>
    key === 'position' ? undefined : item,
  );
  let hash = 14695981039346656037n;
  for (const point of value) {
    hash ^= BigInt(point.codePointAt(0)!);
    hash = BigInt.asUintN(64, hash * 1099511628211n);
  }
  return hash.toString(36);
}

export function nodeText(node: ContentNode | PhrasingContent | Nodes): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'break') return '\n';
  if (node.type === 'image') return node.alt ?? '';
  if ('children' in node) {
    const separator = ['list', 'listItem', 'blockquote', 'root'].includes(
      node.type,
    )
      ? '\n'
      : '';
    return node.children.map(nodeText).join(separator);
  }
  return '';
}

function slug(text: string): string {
  return (
    text
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, '-')
      .replace(/^-|-$/gu, '') || 'heading'
  );
}

export interface ParseMarkdownOptions {
  documentId: string;
  analysis?: boolean;
  role?: ContentBlock['role'];
}

export function parseMarkdown(
  source: string,
  options: ParseMarkdownOptions,
): ContentBlock[] {
  try {
    const root = markdown.parse(source);
    const definitions = new Map<string, Definition>();
    for (const node of root.children) {
      if (
        node.type === 'definition' &&
        !definitions.has(node.identifier.toUpperCase())
      )
        definitions.set(node.identifier.toUpperCase(), node);
    }
    const normalized = normalize(root, definitions) as Root;
    const counts = new Map<string, number>();
    let anchor = `${options.documentId}-introduction`;
    return normalized.children.map((node, order) => {
      if (!['heading', 'paragraph', 'list', 'blockquote'].includes(node.type))
        throw new Error(`Unsupported block: ${node.type}`);
      const contentNode = node as ContentNode;
      const text = nodeText(contentNode);
      if (contentNode.type === 'heading') {
        const number =
          options.analysis && contentNode.depth === 2
            ? Number(/^(\d+)\.\s/u.exec(text)?.[1])
            : 0;
        const key = answerKeys[number - 1];
        const base = `${options.documentId}-${key ?? slug(text)}`;
        const count = (counts.get(base) ?? 0) + 1;
        counts.set(base, count);
        anchor = `${base}${count > 1 ? `-${count}` : ''}`;
        return {
          id: anchor,
          documentId: options.documentId,
          anchor,
          order,
          kind: contentNode.type,
          role: options.role ?? 'writing',
          node: contentNode,
          text,
        };
      }
      const base = `${anchor}-${contentNode.type}-${contentHash(contentNode)}`;
      const count = (counts.get(base) ?? 0) + 1;
      counts.set(base, count);
      return {
        id: `${base}${count > 1 ? `-${count}` : ''}`,
        documentId: options.documentId,
        anchor,
        order,
        kind: contentNode.type,
        role: options.role ?? 'writing',
        node: contentNode,
        text,
      };
    });
  } catch (error) {
    throw new ContentValidationError([
      `${options.documentId}: ${error instanceof Error ? error.message : String(error)}`,
    ]);
  }
}

export function blocksMarkdown(
  blocks: readonly Pick<ContentBlock, 'node'>[],
): string {
  return markdown.stringify({
    type: 'root',
    children: blocks.map(({ node }) => node),
  });
}
