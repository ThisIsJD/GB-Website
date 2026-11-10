import tokens from '../styles/tokens.json';
import type { ReadingLeaf } from '../lib/navigation/engineProtocol';
import type { BookmarkDestination } from '../components/notebook/BookmarkRail';

const colors = new Map(Object.entries(tokens.color.bookmark));

export function bookmarkDestinations(
  pages: ReadingLeaf[],
): BookmarkDestination[] {
  return tokens.bookmarks.map((bookmark) => {
    const color = colors.get(bookmark.colorKey);
    if (!color) throw new Error('A bookmark color is missing.');
    const index = pages.findIndex((page) => page.title === bookmark.label);
    if (index < 0) throw new Error(`The ${bookmark.label} sample is missing.`);
    return { id: bookmark.id, label: bookmark.label, index, ...color };
  });
}

export function sectionAtIndex(
  destinations: BookmarkDestination[],
  index: number,
) {
  return (
    destinations.filter((destination) => destination.index <= index).at(-1)
      ?.id ?? ''
  );
}
