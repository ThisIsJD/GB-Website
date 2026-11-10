import type { CanonicalPortfolio, ContentBlock } from '../content/types';
import type {
  ReadingLeaf,
  PageGeometry,
  OpeningMetadata,
} from '../navigation/engineProtocol';
import type { ContentLeaf } from './paginateContent';
import tokens from '../../styles/tokens.json';
import { profile } from '../../content/profile';
import { workCovers } from '../../content/covers';

export interface CompositionGroup {
  id: string;
  sectionId: string;
  workId?: string;
  title: string;
  blocks: readonly ContentBlock[];
  opening: OpeningMetadata;
}
export interface ComposedLeaf extends ReadingLeaf {
  kind: 'cover' | 'opening' | 'continuation' | 'balance' | 'ending';
  sectionId?: string;
  workId?: string;
}
export interface PageMaps {
  sections: Record<string, number[]>;
  works: Record<string, number[]>;
  answers: Record<string, number[]>;
  blocks: Record<string, number[]>;
  spreads: number[];
}
export type MeasureGroup = (group: CompositionGroup) => Promise<ContentLeaf[]>;

export function readerRailWidth(region: number) {
  return region >= tokens.size.shell.minSpreadRegionPx
    ? tokens.size.shell.desktopRailPx
    : region >= 480
      ? 112
      : 64;
}

export function compositionGeometry(
  region: number,
  bookmarks = false,
): PageGeometry {
  const spread = region >= tokens.size.shell.minSpreadRegionPx;
  const usable =
    region -
    (bookmarks
      ? readerRailWidth(region) * (region >= 480 ? 2 : 1)
      : spread
        ? tokens.size.shell.desktopRailPx
        : 0) -
    (spread || !bookmarks ? 8 : 0);
  return {
    width: Math.min(440, Math.max(240, Math.floor(usable / (spread ? 2 : 1)))),
    height: 620,
    fontSize: bookmarks ? (spread ? 17 : 16) : spread ? 20 : 19,
    lineHeight: bookmarks ? 24 : spread ? 34 : 32,
    padding: spread ? 44 : 20,
    paddingTop: spread ? 40 : 28,
    paddingBottom: 48,
    spread,
  };
}

export function compositionGroups(
  content: CanonicalPortfolio,
): CompositionGroup[] {
  const groups: CompositionGroup[] = [];
  const portrait = content.images.find((image) => image.kind === 'portrait');
  for (const section of content.sections) {
    const document = content.documents.find(({ id }) => id === section.id)!;
    groups.push({
      id: section.id,
      sectionId: section.id,
      title: section.label,
      blocks: document.blocks,
      opening: {
        layoutKey: section.layout.key,
        label: section.label,
        ...(section.id === 'student-profile' && portrait
          ? {
              portrait: {
                src: portrait.src,
                alt: portrait.alt,
                caption: profile.coverName,
                credit: portrait.credit,
                width: portrait.width,
                height: portrait.height,
              },
            }
          : {}),
      },
    });
    if (section.id !== 'literary-analyses') continue;
    for (const work of content.works) {
      const document = content.documents.find(({ id }) => id === work.id)!;
      const tokenId =
        work.id === 'voice-out-of-the-whirlwind' ? 'job-38' : work.id;
      const layoutKey =
        tokens.openingLayouts[tokenId as keyof typeof tokens.openingLayouts];
      const cover = workCovers[work.id as keyof typeof workCovers];
      groups.push({
        id: work.id,
        sectionId: section.id,
        workId: work.id,
        title: work.title,
        blocks: document.blocks,
        opening: {
          layoutKey,
          label:
            work.attribution.name ||
            work.title,
          detail: `${work.mainLens}${work.supportingLens ? ` with ${work.supportingLens}` : ''}`,
          portrait: cover
            ? {
                src: cover.src,
                caption: work.title,
                alt: `Book cover of ${work.title}`,
                credit: cover.credit,
                variant: 'cover',
              }
            : {
                caption: work.title,
                alt: `Photograph for ${work.title}`,
                placeholder: true,
              },
        },
      });
    }
  }
  groups.push({
    id: 'sources',
    sectionId: 'literary-analyses',
    title: 'Sources and credits',
    blocks: content.sources.flatMap(({ blocks }) => blocks),
    opening: { layoutKey: 'sources', label: 'Editions and references' },
  });
  return groups;
}

export async function composePortfolio(
  content: CanonicalPortfolio,
  measure: MeasureGroup,
) {
  const pages: ComposedLeaf[] = [
    {
      id: 'portfolio-front-cover',
      title: 'My Literary Journey',
      markdown: 'A Great Books Digital Portfolio',
      anchor: 'cover',
      hard: true,
      kind: 'cover',
    },
  ];
  const openings: {
    documentId: string;
    layoutKey: string;
    leafIndex: number;
    consumedBlockIds: string[];
    consumedRanges: NonNullable<ReadingLeaf['ranges']>;
  }[] = [];
  const expected = compositionGroups(content);
  for (const group of expected) {
    const measured = await measure(group);
    const leaves = measured.map((leaf, index) => ({
      ...leaf,
      id: `${group.id}-leaf-${index + 1}`,
    }));
    if (!leaves.length) throw new Error(`No composed writing for ${group.id}`);
    // Readings flow continuously; only one optional filler keeps the back cover paired.
    const first = leaves[0]!;
    const consumedRanges = first.ranges ?? [];
    openings.push({
      documentId: group.id,
      layoutKey: group.opening.layoutKey,
      leafIndex: pages.length,
      consumedRanges,
      consumedBlockIds: group.blocks
        .filter((block) =>
          consumedRanges.some(
            (range) =>
              range.blockId === block.id &&
              range.from === 0 &&
              range.to === Array.from(block.text).length,
          ),
        )
        .map(({ id }) => id),
    });
    leaves.forEach((leaf, index) =>
      pages.push({
        ...leaf,
        opening: index === 0 ? group.opening : undefined,
        kind: index === 0 ? 'opening' : 'continuation',
        sectionId: group.sectionId,
        workId: group.workId,
      }),
    );
  }
  // Keep the closing page on the requested page 41.
  while (pages.length < 40)
    pages.push({
      id: `portfolio-end-balance-${pages.length}`,
      title: 'End of the notebook',
      markdown: '',
      anchor: 'balance',
      kind: 'balance',
    });
  pages.push({
    id: 'portfolio-the-end',
    title: 'The End',
    markdown: 'There is still more to learn.',
    anchor: 'the-end',
    kind: 'ending',
  });
  const maps: PageMaps = {
    sections: {},
    works: {},
    answers: {},
    blocks: {},
    spreads: [],
  };
  const add = (
    map: Record<string, number[]>,
    key: string | undefined,
    index: number,
  ) => {
    if (!key) return;
    const indexes = (map[key] ??= []);
    if (indexes.at(-1) !== index) indexes.push(index);
  };
  pages.forEach((page, index) => {
    maps.spreads.push(Math.floor((index + 1) / 2));
    add(maps.sections, page.sectionId, index);
    add(maps.works, page.workId, index);
    for (const range of page.ranges ?? []) {
      add(maps.blocks, range.blockId, index);
      add(maps.answers, range.anchor, index);
    }
  });
  // Validate conservation at the composition boundary, not just in the paginator.
  const allRanges = pages.flatMap((page) => page.ranges ?? []);
  const orderedIds = Array.from(
    new Set(allRanges.map(({ blockId }) => blockId)),
  );
  const blocks = expected.flatMap(({ blocks }) => blocks);
  if (JSON.stringify(orderedIds) !== JSON.stringify(blocks.map(({ id }) => id)))
    throw new Error('Composition reordered or omitted blocks.');
  for (const block of blocks) {
    let offset = 0;
    for (const range of allRanges.filter(
      ({ blockId }) => blockId === block.id,
    )) {
      if (range.from !== offset || range.to <= range.from)
        throw new Error(`Composition duplicated or skipped ${block.id}`);
      offset = range.to;
    }
    if (offset !== Array.from(block.text).length)
      throw new Error(`Composition lost text in ${block.id}`);
  }
  return { pages, maps, openings };
}
