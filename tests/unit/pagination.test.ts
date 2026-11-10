import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  analysisBlocks,
  fragment,
  fragmentMarkdown,
  inlineText,
} from '../../src/lib/pagination/analysisBlocks';
import {
  leafForLocation,
  paginateAnalysis,
  withCovers,
} from '../../src/lib/pagination/paginateAnalysis';

const source = readFileSync(
  new URL('../../src/prototypes/fixtures/odyssey.md', import.meta.url),
  'utf8',
);
const compact = (value: string) => value.replace(/\s/gu, '');

describe('analysis pagination', () => {
  it('conserves every source range and rendered character across different page capacities', async () => {
    const blocks = analysisBlocks(source);
    for (const capacity of [90, 170, 350, 750]) {
      const pages = await paginateAnalysis(
        blocks,
        'The Odyssey',
        (parts) =>
          parts.reduce(
            (sum, part) =>
              sum + Array.from(inlineText(part.node.children)).length,
            0,
          ) <= capacity,
      );
      expect(pages.length).toBeGreaterThan(1);
      for (const block of blocks) {
        const parts = pages
          .flatMap((page) => page.fragments)
          .filter((part) => part.blockId === block.id);
        let offset = 0;
        for (const part of parts) {
          expect(part.from).toBe(offset);
          expect(part.to).toBeGreaterThan(part.from);
          offset = part.to;
        }
        expect(offset).toBe(Array.from(block.text).length);
        expect(
          parts.map((part) => inlineText(part.node.children)).join(''),
        ).toBe(block.text);
        const rendered = parts
          .map((part) =>
            analysisBlocks(fragmentMarkdown([part]))
              .map((node) => node.text)
              .join(''),
          )
          .join('');
        expect(compact(rendered)).toBe(compact(block.text));
      }
      for (const page of pages) {
        expect(page.fragments.at(-1)?.node.type).not.toBe('heading');
      }
    }
  });

  it('splits nested emphasis, Unicode, and link labels without damaging link targets', () => {
    const url = 'https://example.org/' + 'unbroken'.repeat(30);
    const block = analysisBlocks(
      'A **bold _thought_** with [a long source label](' +
        url +
        ') and a smile ??.',
    )[0]!;
    const points = Array.from(block.text);
    for (let index = 0; index < points.length; index++) {
      const part = fragment(block, index, index + 1);
      expect(inlineText(part.node.children)).toBe(points[index]);
    }
    const linkStart = block.text.indexOf('a long source label');
    const slice = fragment(block, linkStart + 2, linkStart + 6);
    expect(slice.node.children[0]).toMatchObject({ type: 'link', url });
    expect(fragmentMarkdown([slice])).toContain(url);
  });

  it('makes bounded progress through a paragraph and an unbroken URL larger than a leaf', async () => {
    const blocks = analysisBlocks('## 1. Answer\n\n' + 'longword'.repeat(120));
    const pages = await paginateAnalysis(
      blocks,
      'Long title',
      (parts) =>
        parts.reduce(
          (sum, part) =>
            sum + Array.from(inlineText(part.node.children)).length,
          0,
        ) <= 80,
    );
    expect(pages.length).toBeGreaterThan(10);
    expect(pages.length).toBeLessThan(20);
    expect(
      pages
        .flatMap((page) => page.fragments)
        .map((part) => inlineText(part.node.children))
        .join(''),
    ).toBe(blocks.map((block) => block.text).join(''));
  });

  it('fails explicitly when readable writing cannot fit, or unsupported blocks are supplied', async () => {
    await expect(
      paginateAnalysis(analysisBlocks(source), 'The Odyssey', () => false),
    ).rejects.toThrow('cannot fit');
    expect(() => analysisBlocks('- unsupported list')).toThrow(
      'Unsupported analysis block',
    );
    expect(() => analysisBlocks('![image](image.jpg)')).toThrow(
      'Unsupported analysis inline',
    );
  });

  it('restores a semantic block offset after pagination and balances physical covers', async () => {
    const blocks = analysisBlocks(source);
    const first = await paginateAnalysis(
      blocks,
      'The Odyssey',
      (parts) =>
        parts.reduce(
          (sum, part) => sum + inlineText(part.node.children).length,
          0,
        ) <= 200,
    );
    const second = await paginateAnalysis(
      blocks,
      'The Odyssey',
      (parts) =>
        parts.reduce(
          (sum, part) => sum + inlineText(part.node.children).length,
          0,
        ) <= 450,
    );
    const reference = first
      .flatMap((page) => page.fragments)
      .find((part) => part.from > 0)!;
    const pages = withCovers(second, 'The Odyssey');
    const index = leafForLocation(pages, {
      anchor: reference.anchor,
      blockId: reference.blockId,
      offset: reference.from,
    });
    expect(
      pages[index]?.ranges?.some(
        (part) =>
          part.blockId === reference.blockId &&
          part.from <= reference.from &&
          part.to > reference.from,
      ),
    ).toBe(true);
    expect(pages.length % 2).toBe(0);
    expect(pages[0]?.hard).toBe(true);
    expect(pages.at(-1)?.hard).toBe(true);
    expect(leafForLocation(pages, { anchor: 'answer-6' })).toBeGreaterThan(0);
  });
});
