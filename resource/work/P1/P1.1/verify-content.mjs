import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { notebook } from '../../../../src/content/notebook.ts';
import { profile } from '../../../../src/content/profile.ts';
import { sections } from '../../../../src/content/sections.ts';
import { works } from '../../../../src/content/works.ts';

const root = new URL('../../../../', import.meta.url);
const read = async (path) =>
  (await readFile(new URL(path, root), 'utf8'))
    .replaceAll('\r\n', '\n')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '_$1_')
    .trim();
const master = await read('resource/Great_Books_Website_Content.md');
const expectedLabels = [
  'Student Profile',
  'Literary Analyses',
  'Favorite Masterpiece',
  'Summary of Learning',
  'Personal Reflection',
];
const questions = [
  'Literary lens and why',
  'Values emphasized',
  'Connection to its civilization',
  'Connection to Bikol culture',
  'Contemporary issue or SDG',
  'Personal reflection',
];

function sourceSection(start, end) {
  const startIndex = master.indexOf(start);
  const endIndex = master.indexOf(end, startIndex + start.length);
  assert.ok(
    startIndex >= 0 && endIndex > startIndex,
    `Source boundaries: ${start}`,
  );
  return master.slice(startIndex + start.length, endIndex).trim();
}

test('inventory exposes exactly five required section labels with existing writing', async () => {
  assert.deepEqual(
    sections.map(({ label }) => label),
    expectedLabels,
  );
  assert.equal(new Set(sections.map(({ id }) => id)).size, 5);
  for (const section of sections) {
    assert.match(section.id, /^[a-z]+(?:-[a-z]+)*$/);
    assert.ok((await read(`src/content/${section.contentPath}`)).length > 100);
    assert.ok(master.includes(section.label));
  }
});

test('all seven analyses conserve each answer and note, in order, with longer reflections', async () => {
  assert.equal(works.length, 7);
  assert.equal(new Set(works.map(({ slug }) => slug)).size, 7);
  for (const [index, work] of works.entries()) {
    const original = sourceSection(
      `### 3.${index + 1} `,
      index === 6 ? '## 4.' : `### 3.${index + 2} `,
    );
    assert.equal(original.split('\n')[0], work.title);
    const copy = await read(`src/content/${work.contentPath}`);
    const headings = [...copy.matchAll(/^## ([1-6])\. (.+)$/gm)];
    assert.deepEqual(
      headings.map((heading) => heading[2]),
      questions,
      work.slug,
    );
    assert.deepEqual(
      headings.map((heading) => Number(heading[1])),
      [1, 2, 3, 4, 5, 6],
    );
    // Independent comparison of every paragraph, including emphasis and punctuation.
    const paragraphWordCounts = [];
    for (const [answerIndex, question] of questions.entries()) {
      const marker = `**${answerIndex + 1}. ${question}**`;
      const startIndex = original.indexOf(marker) + marker.length;
      const nextMarker =
        answerIndex === 5 ? '**Margin note:**' : `**${answerIndex + 2}.`;
      const expected = original
        .slice(startIndex, original.indexOf(nextMarker, startIndex))
        .trim();
      const actualStart =
        headings[answerIndex].index + headings[answerIndex][0].length;
      const actualEnd =
        answerIndex === 5
          ? copy.indexOf('**Margin note:**')
          : headings[answerIndex + 1].index;
      const actual = copy.slice(actualStart, actualEnd).trim();
      assert.equal(actual, expected, `${work.slug}, answer ${answerIndex + 1}`);
      assert.ok(actual.length > 80, `${work.slug}: empty or truncated answer`);
      paragraphWordCounts.push(actual.split(/\s+/).length);
    }
    assert.ok(
      paragraphWordCounts[5] > Math.max(...paragraphWordCounts.slice(0, 5)),
      `${work.slug}: reflection must be longest`,
    );
    assert.equal(
      copy.slice(copy.indexOf('**Margin note:**')),
      original
        .slice(
          original.indexOf('**Margin note:**'),
          original.indexOf('**Sources:**'),
        )
        .trim(),
    );
    assert.doesNotMatch(
      copy,
      /[—;]|Implementation direction|Layout direction|\*\*Sources:\*\*/,
    );
    assert.equal(work.id, work.slug);
    assert.equal(work.contentPath, `analyses/${work.slug}.md`);
    assert.ok(
      original.includes(
        `**${work.attribution.kind === 'traditional' ? 'Traditionally attributed to' : 'Author'}:** ${work.attribution.name}`,
      ),
    );
    assert.ok(original.includes(`**Main lens:** ${work.mainLens}`));
    if (work.supportingLens === null)
      assert.doesNotMatch(original, /\*\*Supporting lens:/);
    else
      assert.ok(
        original.includes(`**Supporting lens:** ${work.supportingLens}`),
      );
  }
});

test('profile, reading list, favorite, learning and reflection conserve all website prose', async () => {
  const profileCopy = await read('src/content/profile.md');
  const intro = sourceSection('### Introduction', '### Small profile note');
  const note = sourceSection(
    '### Small profile note',
    '### Photograph direction',
  );
  assert.equal(profileCopy, `${intro}\n\n${note}`);
  const readingList = await read('src/content/reading-list.md');
  assert.equal(
    readingList,
    sourceSection('### Reading list copy', '| Order |'),
  );
  assert.equal(
    await read('src/content/favorite.md'),
    sourceSection('## 4. Favorite Masterpiece', '**Source:** B5, book 9.'),
  );
  assert.equal(
    await read('src/content/learning.md'),
    sourceSection(
      '## 5. Summary of Learning',
      '**Source for the literary example:**',
    ),
  );
  assert.equal(
    await read('src/content/reflection.md'),
    sourceSection('## 6. Personal Reflection', '## 7. Sources and credits'),
  );
  for (const section of sections) {
    assert.doesNotMatch(
      await read(`src/content/${section.contentPath}`),
      /[—;]|Layout direction|Photograph direction|None selected/,
    );
  }
});

test('personal facts, favorite and most influential lens match JD’s confirmed details', async () => {
  const fields = {
    'Complete name': profile.name,
    Course: profile.course,
    Year: profile.year,
    University: profile.university,
    'Great Books class/section': profile.classSection,
    'Class code': profile.classCode,
  };
  for (const [label, value] of Object.entries(fields)) {
    assert.ok(master.includes(`| ${label} | ${value} |`), label);
  }
  assert.equal(profile.coverName, 'JD');
  assert.equal(profile.favoriteWorkId, 'odyssey');
  assert.equal(
    works.find(({ id }) => id === profile.favoriteWorkId).title,
    'The Odyssey',
  );
  assert.equal(profile.mostInfluentialLens, 'Reader-Response');
  assert.ok(
    (await read('src/content/reflection.md')).includes(
      '**Reader-Response influenced my reading the most.**',
    ),
  );
  assert.ok(
    (await read('src/content/favorite.md')).includes(
      'This is why The Odyssey is my favorite.',
    ),
  );
});

test('cover, inside title and every supporting control retain approved copy', () => {
  assert.ok(master.includes(`**${notebook.title}**`));
  assert.ok(master.includes(notebook.subtitle));
  assert.ok(master.includes(`**${notebook.insideTitle}**`));
  assert.ok(master.includes(notebook.insideDescription));
  assert.equal(notebook.writingStatus, 'draft-from-discussion');
  for (const value of Object.values(notebook.controls))
    assert.ok(master.includes(value), value);
  const sourceControls = sourceSection(
    '| Purpose | Visible copy |',
    'Layout direction:',
  )
    .split('\n')
    .filter((line) => line.startsWith('|') && !line.includes('---'));
  assert.equal(sourceControls.length, Object.keys(notebook.controls).length);
});
