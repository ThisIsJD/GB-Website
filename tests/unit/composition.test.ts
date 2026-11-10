import { describe, it, expect } from 'vitest';
import { portfolio } from '../../src/lib/content/portfolio';
import {
  composePortfolio,
  compositionGroups,
  compositionGeometry,
} from '../../src/lib/pagination/composePortfolio';
import { paginateContent } from '../../src/lib/pagination/paginateContent';

describe('portfolio composition', () => {
  it.each([180, 420])(
    'conserves original blocks with openings, continuations and physical maps at %i',
    async (capacity) => {
      const composed = await composePortfolio(portfolio, (group) =>
        paginateContent(
          group.blocks,
          group.title,
          (parts) =>
            parts.reduce(
              (size, part) => size + Array.from(part.text).length,
              0,
            ) <= capacity,
        ),
      );
      expect(composed.openings).toHaveLength(13);
      expect(composed.pages.length).toBeGreaterThan(1);
      expect(composed.pages[0]?.hard).toBe(true);
      expect(composed.pages.at(-1)?.anchor).toBe('the-end');
      expect(composed.pages.at(-1)?.hard).toBeFalsy();
      for (const opening of composed.openings) {
        expect(composed.pages[opening.leafIndex]?.opening?.layoutKey).toBe(
          opening.layoutKey,
        );
        expect(opening.consumedRanges.length).toBeGreaterThan(0);
      }
      for (const work of portfolio.works) {
        expect(composed.maps.works[work.id]?.length).toBeGreaterThan(0);
        for (const answer of portfolio.documents.find(
          ({ id }) => id === work.id,
        )!.answers) {
          const indexes = composed.maps.answers[answer.anchor]!;
          expect(indexes.length).toBeGreaterThan(0);
          for (const index of indexes)
            expect(
              composed.pages[index]?.ranges?.some(
                ({ anchor }) => anchor === answer.anchor,
              ),
            ).toBe(true);
        }
      }
      composed.pages.forEach((page, index) => {
        expect(composed.maps.spreads[index]).toBe(Math.floor((index + 1) / 2));
        if (page.kind === 'balance' || page.kind === 'cover')
          expect(page.ranges).toBeUndefined();
      });
    },
  );
  it('keeps section order and deduplicates shared citation entries', () => {
    const groups = compositionGroups(portfolio);
    expect(groups[0]?.id).toBe('student-profile');
    expect(groups[1]?.id).toBe('literary-analyses');
    expect(groups[2]?.id).toBe('voice-out-of-the-whirlwind');
    expect(groups.at(-1)?.id).toBe('sources');
    const ids = groups.flatMap(({ blocks }) => blocks.map(({ id }) => id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('rejects a composition with dropped writing', async () => {
    await expect(composePortfolio(portfolio, async () => [])).rejects.toThrow(
      'No composed writing',
    );
    await expect(
      composePortfolio(portfolio, async (group) =>
        (await paginateContent(group.blocks, group.title, () => true)).map(
          (leaf) => ({ ...leaf, ranges: [] }),
        ),
      ),
    ).rejects.toThrow('omitted blocks');
  });
  it('reserves the P3 desktop rail and uses P3 reading metrics without shrinking writing', () => {
    expect(compositionGeometry(904)).toMatchObject({
      width: 360,
      spread: true,
      fontSize: 20,
      padding: 44,
      paddingBottom: 48,
    });
    expect(compositionGeometry(272)).toMatchObject({
      width: 264,
      spread: false,
      fontSize: 19,
      padding: 20,
    });
  });
});
