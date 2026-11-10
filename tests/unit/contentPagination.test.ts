import type { Nodes } from 'mdast';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { parseMarkdown, nodeText } from '../../src/lib/content/parseMarkdown';
import { portfolio } from '../../src/lib/content/portfolio';
import {
  contentFragment,
  contentMarkdown,
} from '../../src/lib/pagination/contentFragments';
import { paginateContent } from '../../src/lib/pagination/paginateContent';
import type { ContentLeaf } from '../../src/lib/pagination/paginateContent';
import type { ContentBlock } from '../../src/lib/content/types';
import {
  requiredImages,
  waitWithSignal,
} from '../../src/lib/pagination/assetReadiness';
import { paginationSample } from '../../src/prototypes/contentPaginationSamples';

const compact = (text: string) => text.replace(/\s/gu, '');
const parse = (source: string) => parseMarkdown(source, { documentId: 'test' });
const fits = (capacity: number) => (parts: readonly { text: string }[]) =>
  parts.reduce((total, part) => total + Array.from(part.text).length, 0) <=
  capacity;

function conserve(blocks: readonly ContentBlock[], leaves: ContentLeaf[]) {
  const fragments = leaves.flatMap(({ fragments }) => fragments);
  expect(Array.from(new Set(fragments.map(({ blockId }) => blockId)))).toEqual(
    blocks.map(({ id }) => id),
  );
  for (const block of blocks) {
    const parts = fragments.filter(({ blockId }) => blockId === block.id);
    let offset = 0;
    for (const part of parts) {
      expect(part.from).toBe(offset);
      expect(part.to).toBeGreaterThan(part.from);
      expect(part.anchor).toBe(block.anchor);
      offset = part.to;
    }
    expect(offset).toBe(Array.from(block.text).length);
    expect(parts.map(({ text }) => text).join('')).toBe(block.text);
    expect(compact(parts.map(({ node }) => nodeText(node)).join(''))).toBe(
      compact(block.text),
    );
    expect(
      compact(
        parse(contentMarkdown(parts))
          .map(({ text }) => text)
          .join(''),
      ),
    ).toBe(compact(block.text));
  }
}

function links(node: Nodes): string[] {
  if (node.type === 'link') return [node.url];
  return 'children' in node ? node.children.flatMap(links) : [];
}

describe('canonical pagination and source conservation', () => {
  it('conserves every original document, citation and note across narrow and wider capacities', async () => {
    for (const capacity of [160, 420]) {
      for (const work of portfolio.works) {
        const sample = paginationSample(work.id, false);
        conserve(
          sample.blocks,
          await paginateContent(sample.blocks, sample.title, fits(capacity)),
        );
      }
      for (const document of portfolio.documents.filter(
        ({ workId }) => !workId,
      ))
        conserve(
          document.blocks,
          await paginateContent(
            document.blocks,
            document.title,
            fits(capacity),
          ),
        );
    }
  });

  it('splits oversized nested lists and quotations while conserving Unicode and full link destinations', async () => {
    const url = `https://example.org/${'long'.repeat(50)}`;
    const blocks = parse(
      `## Writing\n\nA **strong _idea_** 🧭 ${'continues '.repeat(50)}\n\n3. First.\n4. ${'A long item '.repeat(50)}\n5. Last with a nested list:\n   - [Source label](${url})\n   - Another idea.\n\n> ${'An oversized quotation. '.repeat(50)}\n>\n> Its final paragraph.`,
    );
    const leaves = await paginateContent(blocks, 'Writing', fits(140));
    conserve(blocks, leaves);
    expect(leaves.length).toBeGreaterThan(10);
    expect(
      leaves
        .flatMap(({ fragments }) => fragments)
        .flatMap(({ node }) => links(node)),
    ).toContain(url);
    expect(
      leaves.every(
        ({ fragments }) => fragments.at(-1)?.node.type !== 'heading',
      ),
    ).toBe(true);
  });

  it('keeps short paragraphs and lists together when they fit a fresh leaf', async () => {
    const blocks = parse(
      `${'a'.repeat(45)}\n\n${'b'.repeat(60)}\n\n- First short item.\n- Second short item.`,
    );
    const leaves = await paginateContent(blocks, 'Writing', fits(80));
    expect(leaves).toHaveLength(3);
    expect(leaves[1]?.fragments.map(({ blockId }) => blockId)).toEqual([
      blocks[1]!.id,
    ]);
    expect(leaves[2]?.fragments.map(({ blockId }) => blockId)).toEqual([
      blocks[2]!.id,
    ]);
    conserve(blocks, leaves);
  });

  it('prefers whole list-item boundaries and preserves original ordered numbering', async () => {
    const blocks = parse('3. First item.\n4. Second item.\n5. Third item.');
    const leaves = await paginateContent(blocks, 'List', fits(25));
    conserve(blocks, leaves);
    expect(leaves).toHaveLength(2);
    expect(leaves[0]?.fragments[0]?.node).toMatchObject({
      type: 'list',
      start: 3,
      children: [{}, {}],
    });
    expect(leaves[1]?.fragments[0]?.node).toMatchObject({
      type: 'list',
      start: 5,
    });
    expect(contentMarkdown(leaves[1]!.fragments)).toContain('5. Third item.');
  });

  it('keeps consecutive headings with the start of the following list or quotation', async () => {
    for (const body of [
      '- A first item.\n- A second item.',
      '> A quotation with enough words.',
    ]) {
      const blocks = parse(
        `An earlier paragraph.\n\n## Main heading\n\n### Small heading\n\n${body}`,
      );
      const leaves = await paginateContent(blocks, 'Writing', fits(65));
      conserve(blocks, leaves);
      expect(
        leaves.every(
          ({ fragments }) => fragments.at(-1)?.node.type !== 'heading',
        ),
      ).toBe(true);
      expect(
        leaves
          .at(-1)
          ?.fragments.slice(0, 2)
          .map(({ node }) => node.type),
      ).toEqual(['heading', 'heading']);
    }
  });

  it('makes bounded progress through unbroken words and oversized source entries', async () => {
    const blocks = parseMarkdown('x'.repeat(2000), {
      documentId: 'source-b1',
      role: 'source-entry',
    });
    const leaves = await paginateContent(blocks, 'Sources', fits(73));
    expect(leaves).toHaveLength(28);
    conserve(blocks, leaves);
    expect(
      leaves
        .flatMap(({ fragments }) => fragments)
        .every(({ role }) => role === 'source-entry'),
    ).toBe(true);
  });

  it('rejects impossible content, orphan headings, empty writing, and excessive page counts', async () => {
    await expect(
      paginateContent(parse('Readable.'), 'Writing', () => false),
    ).rejects.toThrow('cannot fit');
    await expect(
      paginateContent(parse('## Last heading'), 'Writing', fits(100)),
    ).rejects.toThrow('no following writing');
    await expect(
      paginateContent(parse('-'), 'Writing', fits(100)),
    ).rejects.toThrow('no readable content');
    await expect(
      paginateContent(parse('x'.repeat(200)), 'Writing', fits(10), {
        maxPages: 2,
      }),
    ).rejects.toThrow('page limit');
  });

  it('can be cancelled at a checkpoint without continuing pagination', async () => {
    const checkpoint = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValue(new DOMException('Replaced', 'AbortError'));
    await expect(
      paginateContent(parse('x'.repeat(1000)), 'Writing', fits(100), {
        checkpoint,
      }),
    ).rejects.toThrow('Replaced');
    expect(checkpoint).toHaveBeenCalledTimes(2);
  });

  it('treats inline images as atomic and reports a block that cannot fit whole', async () => {
    const block = parse(
      'Before ![Long image alternative text](/images/profile/jd.jpg) after.',
    )[0]!;
    const start = block.text.indexOf('Long image');
    expect(() => contentFragment(block, start, start + 3)).toThrow(
      'Cannot split an image',
    );
    const leaves = await paginateContent([block], 'Photo', fits(40));
    conserve([block], leaves);
    expect(
      leaves
        .flatMap(({ fragments }) => fragments)
        .filter(({ node }) => nodeText(node).includes('Long image')),
    ).toHaveLength(1);
    await expect(
      paginateContent(
        parse('![JD portrait](/images/profile/jd.jpg)'),
        'Photo',
        () => false,
      ),
    ).rejects.toThrow('cannot fit');
  });

  it('groups a heading with a leading image even when the image alt text exceeds the text probe', async () => {
    const blocks = parse(
      `## Heading\n\n![${'Alternative text '.repeat(6)}](/images/profile/jd.jpg) ${'Writing continues. '.repeat(20)}`,
    );
    const leaves = await paginateContent(blocks, 'Photo', fits(140));
    conserve(blocks, leaves);
    expect(leaves[0]?.fragments[0]?.node.type).toBe('heading');
  });

  it.each([2, 3, 4, 5, 6])(
    'makes progress across structural whitespace at capacity %i',
    async (capacity) => {
      const blocks = parse('- A.\n- B.\n- C.');
      conserve(blocks, await paginateContent(blocks, 'List', fits(capacity)));
    },
  );
});

describe('asset readiness inputs and cancellation', () => {
  afterEach(() => vi.useRealTimers());
  it('waits only for referenced registered images, deduplicates them, and rejects missing dimensions', () => {
    const blocks = parse(
      '![JD](/images/profile/jd.jpg)\n\n![JD again](/images/profile/jd.jpg)',
    );
    expect(requiredImages(blocks, portfolio.images)).toEqual([
      portfolio.images[0],
    ]);
    expect(requiredImages(parse('No image.'), portfolio.images)).toEqual([]);
    expect(() => requiredImages(blocks, [])).toThrow('metadata is unavailable');
    expect(() =>
      requiredImages(blocks, [{ ...portfolio.images[0]!, width: 0 }]),
    ).toThrow('metadata is unavailable');
  });

  it('rejects pending waits promptly on cancellation and removes abort listeners on completion', async () => {
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, 'removeEventListener');
    await expect(
      waitWithSignal(Promise.resolve('ready'), controller.signal),
    ).resolves.toBe('ready');
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    const pending = waitWithSignal(new Promise(() => {}), controller.signal);
    controller.abort(new Error('Replaced'));
    await expect(pending).rejects.toThrow('Replaced');
    expect(() => waitWithSignal(Promise.resolve(), controller.signal)).toThrow(
      'Replaced',
    );
  });
});
