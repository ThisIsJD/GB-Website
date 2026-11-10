import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';
import {
  sources,
  workSourceNotes,
  sectionSourceIds,
  sourceContext,
} from '../../../../src/content/sources.ts';
import { works } from '../../../../src/content/works.ts';
import { sections } from '../../../../src/content/sections.ts';
import { profile } from '../../../../src/content/profile.ts';
import {
  mediaAssets,
  pendingMediaCredits,
} from '../../../../src/content/assets.ts';

const root = new URL('../../../../', import.meta.url);
const master = (
  await readFile(
    new URL('resource/Great_Books_Website_Content.md', root),
    'utf8',
  )
).replaceAll('\r\n', '\n');
const byId = new Map(sources.map((source) => [source.id, source]));

test('all thirteen citations retain their original editions and exact linked URLs', () => {
  assert.equal(sources.length, 13);
  assert.equal(byId.size, sources.length);
  for (const source of sources) {
    if (source.kind !== 'sdg')
      assert.ok(
        master.includes(`**${source.id}.** ${source.citation}`),
        source.id,
      );
    else {
      assert.ok(master.includes(source.citation.split('\n\n')[0]));
      assert.ok(master.includes(source.citation.split('\n\n')[1]));
    }
    assert.ok(source.links.length > 0, source.id);
    const originalLinks = [
      ...source.citation.matchAll(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g),
    ].map(([, label, url]) => ({ label, url }));
    assert.deepEqual(source.links, originalLinks);
    for (const link of source.links)
      assert.equal(new URL(link.url).protocol, 'https:');
  }
  assert.match(byId.get('B1').citation, /King James Version/);
  assert.match(byId.get('B3').citation, /Edwin Arnold.+chapter 1/);
  assert.match(byId.get('B3').citation, /not a source for every episode/);
  assert.match(byId.get('B5').citation, /Samuel Butler/);
  assert.match(
    byId.get('B6').citation,
    /Edward Seidensticker.+1976.+Chapter 2 excerpt/,
  );
  assert.match(byId.get('B7').citation, /Isabel F. Hapgood, 1887/);
  assert.ok(master.includes(sourceContext.editionDisclaimer));
  assert.ok(master.includes(sourceContext.sdgDisclaimer));
});

test('each work resolves the exact sources for its text, culture and SDG connection', () => {
  const expected = [
    ['B1', 'SDG4'],
    ['B2', 'SDG16'],
    ['B3', 'C1', 'SDG16'],
    ['B4', 'SDG16'],
    ['B5', 'SDG16'],
    ['B6', 'C2', 'SDG5'],
    ['B7', 'SDG1'],
  ];
  const originalNotes = [...master.matchAll(/^\*\*Sources:\*\* (.+)$/gm)].map(
    ([, note]) => note,
  );
  for (const [index, work] of works.entries()) {
    assert.deepEqual(work.sourceIds, expected[index]);
    for (const id of work.sourceIds)
      assert.ok(byId.has(id), `${work.slug}: ${id}`);
    assert.equal(workSourceNotes[work.id], originalNotes[index]);
  }
  assert.match(
    workSourceNotes.odyssey,
    /Ulysses and Minerva for Odysseus and Athena/,
  );
  assert.match(
    workSourceNotes['tale-of-genji'],
    /not automatically the author's own beliefs/,
  );
  assert.equal(Object.keys(workSourceNotes).length, 7);
  assert.deepEqual(
    Object.keys(sectionSourceIds),
    sections.map(({ id }) => id),
  );
  assert.deepEqual(sectionSourceIds['favorite-masterpiece'], ['B5']);
  assert.deepEqual(sectionSourceIds['summary-of-learning'], ['B4']);
  for (const ids of Object.values(sectionSourceIds))
    for (const id of ids) assert.ok(byId.has(id));
});

test('asset records resolve JD’s supplied portrait with its exact alternative text', async () => {
  assert.equal(mediaAssets.length, 1);
  assert.equal(mediaAssets[0].id, profile.portraitId);
  for (const asset of mediaAssets) {
    assert.ok(asset.src.startsWith('/images/'));
    await access(new URL(`public${asset.src}`, root));
    assert.ok(asset.credit && asset.permission);
    assert.equal(asset.status, 'supplied');
    assert.equal(asset.alt, profile.name);
    assert.equal(asset.sourceFile, 'assets/picnijd.jpg');
  }
  const photo = await readFile(new URL(`public${mediaAssets[0].src}`, root));
  assert.equal(photo.readUInt16BE(0), 0xffd8, 'JPEG start marker');
  assert.equal(photo.readUInt16BE(photo.length - 2), 0xffd9, 'JPEG end marker');
  assert.ok(photo.length > 1000);
  assert.equal(mediaAssets[0].width, 400);
  assert.equal(mediaAssets[0].height, 400);
  assert.equal(
    pendingMediaCredits.find(
      ({ id }) => id === 'optional-illustrations-and-doodles',
    ).status,
    'none-selected',
  );
});
