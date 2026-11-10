import type { ContentBlock } from '../content/types';
import type { ReadingLeaf } from '../navigation/engineProtocol';
import {
  atomicEnd,
  contentFragment,
  contentMarkdown,
  preferredEnd,
  minimumEnd,
} from './contentFragments';
import type { ContentFragment } from './contentFragments';

export interface ContentLeaf extends ReadingLeaf {
  fragments: ContentFragment[];
}
export type ContentFits = (parts: readonly ContentFragment[]) => boolean;
export interface PaginationOptions {
  checkpoint?: () => Promise<void>;
  maxPages?: number;
  idPrefix?: string;
}

export class PaginationError extends Error {
  constructor(
    message: string,
    public readonly blockId?: string,
  ) {
    super(message);
    this.name = 'PaginationError';
  }
}

function openingProbe(block: ContentBlock): ContentFragment {
  const end = minimumEnd(block, Math.min(40, Array.from(block.text).length));
  return contentFragment(block, 0, end);
}

/** DOM fitting is injected; this module never estimates pixels from characters. */
export async function paginateContent(
  blocks: readonly ContentBlock[],
  title: string,
  fits: ContentFits,
  options: PaginationOptions = {},
): Promise<ContentLeaf[]> {
  const maxPages = options.maxPages ?? 500;
  if (!Number.isInteger(maxPages) || maxPages < 1)
    throw new PaginationError('Invalid page limit.');
  const leaves: ContentLeaf[] = [];
  let index = 0;
  let offset = 0;
  while (index < blocks.length) {
    await options.checkpoint?.();
    if (leaves.length >= maxPages)
      throw new PaginationError(
        'Content exceeds the page limit.',
        blocks[index]?.id,
      );
    const initial = `${index}:${offset}`;
    const parts: ContentFragment[] = [];
    while (index < blocks.length) {
      const block = blocks[index]!;
      const size = Array.from(block.text).length;
      if (!size)
        throw new PaginationError('A block has no readable content.', block.id);
      if (block.kind === 'heading') {
        const headings: ContentFragment[] = [];
        let nextIndex = index;
        while (blocks[nextIndex]?.kind === 'heading')
          headings.push(contentFragment(blocks[nextIndex++]!));
        const next = blocks[nextIndex];
        if (!next)
          throw new PaginationError(
            'A heading has no following writing.',
            block.id,
          );
        if (!fits([...parts, ...headings, openingProbe(next)])) break;
        parts.push(...headings);
        index = nextIndex;
        continue;
      }
      const whole = contentFragment(block, offset, size);
      if (fits([...parts, whole])) {
        parts.push(whole);
        index++;
        offset = 0;
        continue;
      }
      if (
        parts.length &&
        parts.at(-1)?.node.type !== 'heading' &&
        fits([whole])
      )
        break;
      let low = offset;
      let high = size;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        const end = atomicEnd(block, middle);
        if (
          end <= offset ||
          fits([...parts, contentFragment(block, offset, end)])
        )
          low = middle;
        else high = middle - 1;
      }
      const end = preferredEnd(block, offset, atomicEnd(block, low));
      if (end > offset) {
        parts.push(contentFragment(block, offset, end));
        offset = end;
        if (offset === size) {
          index++;
          offset = 0;
        }
      }
      break;
    }
    if (
      !parts.length ||
      initial === `${index}:${offset}` ||
      parts.at(-1)?.node.type === 'heading'
    )
      throw new PaginationError(
        'The page cannot fit this content at a readable size.',
        blocks[index]?.id,
      );
    leaves.push({
      id: `${options.idPrefix ?? blocks[0]!.documentId}-leaf-${leaves.length + 1}`,
      title,
      anchor: parts[0]!.anchor,
      markdown: contentMarkdown(parts),
      fragments: parts,
      ranges: parts.map(({ blockId, anchor, from, to }) => ({
        blockId,
        anchor,
        from,
        to,
      })),
    });
  }
  return leaves;
}
