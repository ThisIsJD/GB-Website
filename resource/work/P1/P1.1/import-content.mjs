import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../../', import.meta.url);
const master = (
  await readFile(
    new URL('resource/Great_Books_Website_Content.md', root),
    'utf8',
  )
).replaceAll('\r\n', '\n');
const destination = new URL('src/content/', root);

function between(start, end) {
  const startIndex = master.indexOf(start);
  assert.ok(startIndex >= 0, `Missing start: ${start}`);
  const endIndex = master.indexOf(end, startIndex + start.length);
  assert.ok(endIndex > startIndex, `Missing end: ${end}`);
  return master.slice(startIndex + start.length, endIndex).trim();
}

async function save(path, content) {
  // Use the repository formatter's italic delimiter without changing emphasis.
  const formatted = content
    .trim()
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '_$1_');
  await writeFile(new URL(path, destination), `${formatted}\n`, 'utf8');
}

await mkdir(new URL('analyses/', destination), { recursive: true });
const slugs = [
  'voice-out-of-the-whirlwind',
  'panchatantra',
  'mahabharata',
  'iliad',
  'odyssey',
  'tale-of-genji',
  'les-miserables',
];
for (const [index, slug] of slugs.entries()) {
  const section = between(
    `### 3.${index + 1} `,
    index === 6 ? '## 4.' : `### 3.${index + 2} `,
  );
  const answerStart = section.indexOf('**1. Literary lens and why**');
  const sourcesStart = section.indexOf('**Sources:**');
  assert.ok(answerStart >= 0 && sourcesStart > answerStart);
  const body = section
    .slice(answerStart, sourcesStart)
    .trim()
    .replace(/^\*\*(\d\. [^\n]+)\*\*$/gm, '## $1');
  assert.equal([...body.matchAll(/^## [1-6]\. /gm)].length, 6);
  await save(`analyses/${slug}.md`, body);
}

const introduction = between(
  '### Introduction',
  '### Photograph direction',
).replace('\n\n### Small profile note', '');
await save('profile.md', introduction);
await save('reading-list.md', between('### Reading list copy', '| Order |'));
await save(
  'favorite.md',
  between('## 4. Favorite Masterpiece', '**Source:** B5, book 9.'),
);
await save(
  'learning.md',
  between('## 5. Summary of Learning', '**Source for the literary example:**'),
);
await save(
  'reflection.md',
  between('## 6. Personal Reflection', '## 7. Sources and credits'),
);

console.log(
  `Imported 7 analyses and 5 section files into ${fileURLToPath(destination)}`,
);
