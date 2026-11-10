/// <reference types="vite/client" />
import { sections } from '../../content/sections';
import { works } from '../../content/works';
import { mediaAssets } from '../../content/assets';
import { profile } from '../../content/profile';
import {
  sources,
  sectionSourceIds,
  workSourceNotes,
} from '../../content/sources';
import { sectionLayouts, workLayouts } from '../../content/layouts';
import { buildPortfolio } from './buildPortfolio';

const documents = import.meta.glob<string>('../../content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const publicFiles = import.meta.glob('/public/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Importing the registry validates every document and reference before rendering. */
export const portfolio = buildPortfolio({
  sections,
  works,
  sources,
  images: mediaAssets,
  sectionSourceIds,
  sectionLayouts,
  workLayouts,
  workSourceNotes,
  favoriteWorkId: profile.favoriteWorkId,
  portraitId: profile.portraitId,
  markdown: Object.fromEntries(
    Object.entries(documents).map(([path, source]) => [
      path.replace('../../content/', ''),
      source,
    ]),
  ),
  availableAssets: Object.keys(publicFiles).map((path) =>
    path.replace('/public', ''),
  ),
});
