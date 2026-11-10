import { portfolio } from '../content/portfolio';
import { compositionGroups } from '../pagination/composePortfolio';
import type { ReadingLocation } from '../pagination/analysisBlocks';

export const notebookGroups = compositionGroups(portfolio);
const sectionPaths: Record<string, string> = {
  'student-profile': '/profile',
  'literary-analyses': '/analyses',
  'favorite-masterpiece': '/favorite',
  'summary-of-learning': '/learning',
  'personal-reflection': '/reflection',
  sources: '/analyses',
};

export function blockForTarget(target: string) {
  return (
    notebookGroups
      .flatMap(({ blocks }) => blocks)
      .find((block) => block.id === target || block.anchor === target) ??
    notebookGroups.find(({ id }) => id === target)?.blocks[0]
  );
}

export function groupForLocation(location: ReadingLocation) {
  const block = blockForTarget(location.blockId ?? location.anchor);
  return notebookGroups.find((group) =>
    group.blocks.some(({ id }) => id === block?.id),
  );
}

export function locationForTarget(target: string): ReadingLocation {
  const block = blockForTarget(target)!;
  return { anchor: block.anchor, blockId: block.id, offset: 0 };
}

export function readNotebookRoute(pathname: string, search: string) {
  const path = pathname.replace(/\/$/u, '') || '/';
  const params = new URLSearchParams(search);
  const work = portfolio.works.find(({ slug }) => path === `/analyses/${slug}`);
  const section = Object.entries(sectionPaths).find(
    ([id, value]) => id !== 'sources' && value === path,
  )?.[0];
  if (path !== '/notebook' && !work && !section) return null;
  const groupId = work?.id ?? section ?? 'student-profile';
  const target = params.get('at');
  const block = target ? blockForTarget(target) : undefined;
  const group = block
    ? groupForLocation({ anchor: block.anchor, blockId: block.id })
    : undefined;
  const allowed =
    path === '/notebook' ||
    group?.id === groupId ||
    (path === '/analyses' && group?.id === 'sources');
  const recovered = !!target && (!block || !allowed);
  const location = locationForTarget(block && allowed ? block.id : groupId);
  const offset = Number(params.get('offset') ?? 0);
  if (
    block &&
    allowed &&
    Number.isSafeInteger(offset) &&
    offset >= 0 &&
    offset < block.text.length
  )
    location.offset = offset;
  return { location, recovered, reading: params.get('view') === 'reading' };
}

export function notebookUrl(location: ReadingLocation, reading: boolean) {
  const group = groupForLocation(location) ?? notebookGroups[0]!;
  const work = portfolio.works.find(({ id }) => id === group.id);
  const path = work ? `/analyses/${work.slug}` : sectionPaths[group.id]!;
  const params = new URLSearchParams();
  const first = group.blocks[0]!;
  const block = blockForTarget(location.blockId ?? location.anchor) ?? first;
  if (
    block.id !== first.id ||
    group.id === 'sources' ||
    (location.offset ?? 0) > 0
  )
    params.set('at', block.id);
  if ((location.offset ?? 0) > 0) params.set('offset', String(location.offset));
  if (reading) params.set('view', 'reading');
  return `${path}${params.size ? `?${params}` : ''}`;
}
