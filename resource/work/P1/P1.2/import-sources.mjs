import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../../../../', import.meta.url);
const master = (
  await readFile(
    new URL('resource/Great_Books_Website_Content.md', root),
    'utf8',
  )
).replaceAll('\r\n', '\n');
const titles = {
  B1: 'The Bible, King James Version, Job 38',
  B2: 'The Panchatantra',
  B3: 'The Bhagavad Gita, chapter 1',
  B4: 'The Iliad',
  B5: 'The Odyssey',
  B6: 'The Tale of Genji, chapter 2 excerpt',
  B7: 'Les Misérables',
  C1: 'Mahabharata: cultural background',
  C2: 'The Tale of Genji: A Japanese Classic Illuminated',
};
const sources = [
  ...master.matchAll(/^\*\*((?:B[1-7]|C[12]))\.\*\* (.+)$/gm),
].map(([, id, citation]) => ({
  id,
  kind: id.startsWith('B') ? 'literary' : 'cultural',
  title: titles[id],
  citation,
  links: [...citation.matchAll(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g)].map(
    ([, label, url]) => ({ label, url }),
  ),
}));
assert.equal(sources.length, 9);
const sdgIntro = master.match(
  /^United Nations, Department of Economic and Social Affairs\..+$/m,
)?.[0];
assert.ok(sdgIntro);
for (const [, number, label, url] of master
  .matchAll(/^- \[(Goal (\d+): [^\]]+)\]\((https:\/\/[^)]+)\)\.$/gm)
  .map((match) => [match[0], match[2], match[1], match[3]])) {
  sources.push({
    id: `SDG${number}`,
    kind: 'sdg',
    title: label,
    citation: `${sdgIntro}\n\n[${label}](${url}).`,
    links: [{ label, url }],
  });
}
assert.equal(sources.length, 13);

const slugs = [
  'voice-out-of-the-whirlwind',
  'panchatantra',
  'mahabharata',
  'iliad',
  'odyssey',
  'tale-of-genji',
  'les-miserables',
];
const notes = [...master.matchAll(/^\*\*Sources:\*\* (.+)$/gm)].map(
  ([, note]) => note,
);
assert.equal(notes.length, 7);
const workSourceNotes = Object.fromEntries(
  slugs.map((slug, index) => [slug, notes[index]]),
);
const editionDisclaimer = master.match(
  /^The following entries use MLA-style.+$/m,
)?.[0];
const sdgDisclaimer = master.match(
  /^These are present-day connections.+$/m,
)?.[0];
assert.ok(editionDisclaimer && sdgDisclaimer);
const text = `import type { SectionId, SourceId, SourceRecord, WorkId } from './types';

/** Citations and access dates imported from the companion file, not newly verified. */
export const sources = ${JSON.stringify(sources, null, 2)} as const satisfies readonly SourceRecord[];

export const workSourceNotes = ${JSON.stringify(workSourceNotes, null, 2)} as const satisfies Record<WorkId, string>;

export const sectionSourceIds = {
  'student-profile': [],
  'literary-analyses': sources.map(({ id }) => id),
  'favorite-masterpiece': ['B5'],
  'summary-of-learning': ['B4'],
  'personal-reflection': [],
} as const satisfies Record<SectionId, readonly SourceId[]>;

export const sourceContext = ${JSON.stringify({ editionDisclaimer, sdgDisclaimer }, null, 2)} as const;
`;
await writeFile(new URL('src/content/sources.ts', root), text, 'utf8');
console.log('Imported 13 linked source records and 7 original source notes.');
