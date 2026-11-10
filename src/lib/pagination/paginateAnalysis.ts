import type { ReadingLeaf } from '../navigation/engineProtocol';
import {
  fragment,
  fragmentMarkdown,
  wordBoundary,
  type AnalysisBlock,
  type BlockFragment,
  type ReadingLocation,
} from './analysisBlocks';

export interface MeasuredLeaf extends ReadingLeaf {
  fragments: BlockFragment[];
}
export type FitsPage = (fragments: BlockFragment[]) => boolean;

export async function paginateAnalysis(
  blocks: AnalysisBlock[],
  title: string,
  fits: FitsPage,
  checkpoint: () => Promise<void> = () => Promise.resolve(),
): Promise<MeasuredLeaf[]> {
  const leaves: MeasuredLeaf[] = [];
  let blockIndex = 0;
  let offset = 0;
  while (blockIndex < blocks.length) {
    await checkpoint();
    const parts: BlockFragment[] = [];
    while (blockIndex < blocks.length) {
      const block = blocks[blockIndex]!;
      const length = Array.from(block.text).length;
      if (block.node.type === 'heading') {
        const next = blocks[blockIndex + 1];
        // Keep the answer heading with at least the start of its writing.
        const probe =
          next && next.node.type === 'paragraph'
            ? [
                fragment(block),
                fragment(next, 0, Math.min(40, Array.from(next.text).length)),
              ]
            : [fragment(block)];
        if (!fits([...parts, ...probe])) break;
        parts.push(fragment(block));
        blockIndex++;
        continue;
      }
      const whole = fragment(block, offset, length);
      if (fits([...parts, whole])) {
        parts.push(whole);
        offset = 0;
        blockIndex++;
        continue;
      }
      // If the whole paragraph fits a fresh leaf, keep it together.
      if (
        parts.length &&
        parts.at(-1)?.node.type !== 'heading' &&
        fits([whole])
      )
        break;
      let low = offset;
      let high = length;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (fits([...parts, fragment(block, offset, middle)])) low = middle;
        else high = middle - 1;
      }
      const end = wordBoundary(block.text, offset, low);
      if (end > offset) {
        parts.push(fragment(block, offset, end));
        offset = end;
      }
      break;
    }
    if (!parts.length) throw new Error('The page cannot fit readable writing.');
    leaves.push({
      id: `analysis-${leaves.length + 1}`,
      title,
      anchor: parts[0]!.anchor,
      markdown: fragmentMarkdown(parts),
      fragments: parts,
      ranges: parts.map(({ blockId, anchor, from, to }) => ({
        blockId,
        anchor,
        from,
        to,
      })),
    });
    if (leaves.length >= 500)
      throw new Error('Analysis exceeds the prototype page limit.');
  }
  return leaves;
}

export function leafForLocation(
  pages: ReadingLeaf[],
  location: ReadingLocation,
): number {
  if (location.blockId !== undefined) {
    const index = pages.findIndex((page) =>
      page.ranges?.some(
        (part) =>
          part.blockId === location.blockId &&
          (location.offset ?? 0) >= part.from &&
          (location.offset ?? 0) < part.to,
      ),
    );
    if (index >= 0) return index;
  }
  const index = pages.findIndex((page) =>
    page.ranges?.some((part) => part.anchor === location.anchor),
  );
  return index >= 0 ? index : 1;
}

export function withCovers(
  leaves: MeasuredLeaf[],
  title: string,
): ReadingLeaf[] {
  const pages: ReadingLeaf[] = [
    {
      id: 'analysis-cover',
      title,
      markdown: 'Six answers from my Great Books notebook.',
      anchor: 'cover',
      hard: true,
    },
    ...leaves,
  ];
  if (leaves.length % 2)
    pages.push({
      id: 'analysis-end-note',
      title: 'End of this reading',
      markdown:
        'All six answers are complete. Use the answer menu to read them again.',
      anchor: 'end',
    });
  pages.push({
    id: 'analysis-back-cover',
    title: 'My Literary Journey',
    markdown: 'There is still more to learn.',
    anchor: 'end',
    hard: true,
  });
  return pages;
}
