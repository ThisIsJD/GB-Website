import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { ContentBlocks } from '../../src/components/content/ContentBlocks';
import { sections } from '../../src/content/sections';
import { works } from '../../src/content/works';
import {
  sources,
  sectionSourceIds,
  workSourceNotes,
} from '../../src/content/sources';
import { mediaAssets } from '../../src/content/assets';
import { sectionLayouts, workLayouts } from '../../src/content/layouts';
import { buildPortfolio } from '../../src/lib/content/buildPortfolio';
import type { PortfolioInput } from '../../src/lib/content/buildPortfolio';
import {
  blocksMarkdown,
  nodeText,
  parseMarkdown,
} from '../../src/lib/content/parseMarkdown';
import { portfolio } from '../../src/lib/content/portfolio';
import { answerKeys } from '../../src/lib/content/types';

function input(): PortfolioInput {
  const paths = [...sections, ...works].map(({ contentPath }) => contentPath);
  return {
    sections,
    works,
    sources,
    images: mediaAssets,
    sectionSourceIds,
    sectionLayouts,
    workLayouts,
    workSourceNotes,
    favoriteWorkId: 'odyssey',
    portraitId: 'jd-portrait',
    markdown: Object.fromEntries(
      paths.map((path) => [
        path,
        readFileSync(resolve('src/content', path), 'utf8'),
      ]),
    ),
    availableAssets: readdirSync(resolve('public'), {
      recursive: true,
      withFileTypes: true,
    })
      .filter((file) => file.isFile())
      .map(
        (file) =>
          `/${resolve(file.parentPath, file.name)
            .slice(resolve('public').length + 1)
            .replaceAll('\\', '/')}`,
      ),
  };
}

const parse = (source: string) =>
  parseMarkdown(source, { documentId: 'sample' });
const text = (source: string) =>
  nodeText(unified().use(remarkParse).parse(source));

describe('canonical portfolio', () => {
  it('loads five sections, seven works, 42 answers and thirteen sources from actual repository files', () => {
    expect(portfolio).toEqual(buildPortfolio(input()));
    expect(portfolio.sections.map(({ label }) => label)).toEqual([
      'Student Profile',
      'Literary Analyses',
      'Favorite Masterpiece',
      'Summary of Learning',
      'Personal Reflection',
    ]);
    expect(portfolio.works.map(({ id }) => id)).toEqual(
      works.map(({ id }) => id),
    );
    expect(portfolio.documents.flatMap(({ answers }) => answers)).toHaveLength(
      42,
    );
    expect(portfolio.sources).toHaveLength(13);
  });

  it('conserves every writing, source citation, and source-note character in source order', () => {
    const raw = input().markdown;
    for (const document of portfolio.documents) {
      expect(document.blocks.map(({ text }) => text).join('\n')).toBe(
        text(raw[document.contentPath]!),
      );
      expect(text(blocksMarkdown(document.blocks))).toBe(
        text(raw[document.contentPath]!),
      );
    }
    for (const source of portfolio.sources)
      expect(source.blocks.map(({ text }) => text).join('\n')).toBe(
        text(source.citation),
      );
    for (const work of portfolio.works)
      expect(work.sourceNote.map(({ text }) => text).join('\n')).toBe(
        text(workSourceNotes[work.id]),
      );
  });

  it('exposes stable semantic answer anchors and ordered member block IDs', () => {
    for (const document of portfolio.documents.filter(({ workId }) => workId)) {
      expect(document.answers.map(({ key }) => key)).toEqual(answerKeys);
      for (const answer of document.answers) {
        expect(answer.anchor).toBe(`${document.id}-${answer.key}`);
        expect(answer.blockIds).toEqual(
          document.blocks
            .filter(({ anchor }) => anchor === answer.anchor)
            .map(({ id }) => id),
        );
      }
    }
  });

  it('renders identical ordered writing for a complete view and notebook block partitions', () => {
    for (const document of portfolio.documents) {
      const complete = renderToStaticMarkup(
        createElement(ContentBlocks, { blocks: document.blocks }),
      );
      const partitions = document.blocks
        .map((block) =>
          renderToStaticMarkup(
            createElement(ContentBlocks, {
              blocks: [block],
              embedded: true,
            }),
          ),
        )
        .join('');
      const blockIds = (html: string) =>
        Array.from(
          html.matchAll(/data-block-id="([^"]+)"/gu),
          (match) => match[1],
        );
      const writing = (html: string) => html.replace(/<[^>]*>/gu, '');
      expect(blockIds(partitions)).toEqual(blockIds(complete));
      expect(writing(partitions)).toBe(writing(complete));
    }
  });

  it('preserves portrait details and original attribution distinctions', () => {
    expect(portfolio.images[0]).toMatchObject({
      id: 'jd-portrait',
      width: 400,
      height: 400,
      alt: 'John Daniel P. Labing',
    });
    expect(
      portfolio.works.find(({ id }) => id === 'panchatantra')?.attribution.kind,
    ).toBe('traditional');
    expect(portfolio.works[0]?.slug).toBe('voice-out-of-the-whirlwind');
  });
});

describe('supported Markdown and stable identity', () => {
  it('keeps headings, inline marks, ordered/nested lists, quotations, Unicode and hard breaks', () => {
    const source =
      '## Heading\n\nA **bold** and _quiet_ `idea` 😀.  \nNext line.\n\n3. First\n4. Second\n   - Inner\n\n> A quote with **meaning**.';
    const blocks = parse(source);
    expect(blocks.map(({ kind }) => kind)).toEqual([
      'heading',
      'paragraph',
      'list',
      'blockquote',
    ]);
    expect(text(blocksMarkdown(blocks))).toBe(text(source));
    const html = renderToStaticMarkup(createElement(ContentBlocks, { blocks }));
    expect(html).toContain('<ol start="3">');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<strong>meaning</strong>');
    expect(html).toContain('😀');
  });

  it('resolves reference links and local images without losing labels or destinations', () => {
    const blocks = parse(
      '[Read **this**][source].\n\n![JD][portrait]\n\n[source]: https://example.com/book "Edition"\n[portrait]: /images/profile/jd.jpg',
    );
    const html = renderToStaticMarkup(
      createElement(ContentBlocks, { blocks, embedded: true }),
    );
    expect(html).toContain('href="https://example.com/book"');
    expect(html).toContain('<strong>this</strong>');
    expect(html).toContain('alt="JD"');
    expect(html).toContain('target="_blank"');
  });

  it('keeps link titles, local fragment behavior and CommonMark first-definition precedence', () => {
    const blocks = parse(
      '## Values\n\n[Here](#sample-values "Answer") and [edition][book].\n\n[book]: https://example.com/first\n[book]: https://example.com/second',
    );
    const html = renderToStaticMarkup(
      createElement(ContentBlocks, { blocks, embedded: true }),
    );
    expect(html).toContain(
      'href="#sample-values" title="Answer" target="_parent"',
    );
    expect(html).toContain('href="https://example.com/first"');
    expect(html).not.toContain('https://example.com/second');
  });

  it('keeps existing block IDs when a different paragraph is inserted', () => {
    const before = parse('## Values\n\nFirst idea.\n\nSecond idea.');
    const after = parse(
      'New introduction.\n\n## Values\n\nA new idea.\n\nFirst idea.\n\nSecond idea.',
    );
    for (const block of before)
      expect(after.find(({ text }) => text === block.text)?.id).toBe(block.id);
  });

  it('gives identical sibling paragraphs distinct reproducible IDs', () => {
    const blocks = parse('Same.\n\nSame.');
    expect(new Set(blocks.map(({ id }) => id)).size).toBe(2);
    expect(parse('Same.\n\nSame.')).toEqual(blocks);
  });

  it('removes block and inline raw HTML, including scripts, in both renderer modes', () => {
    const blocks = parse(
      'Before <b>plain</b>.\n\n<script>alert("bad")</script>\n\nAfter.',
    );
    for (const embedded of [false, true]) {
      const html = renderToStaticMarkup(
        createElement(ContentBlocks, { blocks, embedded }),
      );
      expect(html).toContain('Before plain.');
      expect(html).toContain('After.');
      expect(html).not.toMatch(/<script|alert|<b>/u);
    }
  });

  it.each([
    '```js\nconst value = 1;\n```',
    '---',
    '![image](javascript:alert)',
    '[link](javascript:alert)',
    '[link][missing]',
  ])('rejects unsupported syntax or unsafe destinations: %s', (source) => {
    // Unresolved CommonMark reference syntax is literal text, not a missing AST reference.
    if (source === '[link][missing]')
      expect(parse(source)[0]?.text).toBe(source);
    else
      expect(() => parse(source)).toThrow(
        /Unsupported Markdown|Unsafe or unsupported URL/u,
      );
  });
});

describe('validation failures', () => {
  it('rejects duplicate slugs and source IDs', () => {
    const data = input();
    expect(() =>
      buildPortfolio({
        ...data,
        works: data.works.map((work, index) =>
          index === 1 ? { ...work, slug: 'odyssey' } : work,
        ),
      }),
    ).toThrow('Duplicate work slug: odyssey');
    expect(() =>
      buildPortfolio({ ...data, sources: [...data.sources, data.sources[0]!] }),
    ).toThrow('Duplicate source ID: B1');
  });

  it('rejects missing Markdown and incorrect section labels', () => {
    const data = input();
    expect(() =>
      buildPortfolio({
        ...data,
        markdown: { ...data.markdown, 'analyses/odyssey.md': '' },
      }),
    ).toThrow('Missing or empty Markdown: analyses/odyssey.md');
    expect(() =>
      buildPortfolio({
        ...data,
        sections: data.sections.map((section, index) =>
          index === 0 ? { ...section, label: 'Profile' } : section,
        ),
      }),
    ).toThrow('Section 1 must be Student Profile');
  });

  it.each([
    [
      'missing',
      (source: string) => source.replace(/## 4\.[\s\S]*?(?=## 5\.)/u, ''),
    ],
    ['duplicate', (source: string) => source.replace('## 4.', '## 3.')],
    ['reordered', (source: string) => source.replace('## 4.', '## 7.')],
    [
      'empty',
      (source: string) =>
        source.replace(/(## 4\.[^\n]+)\n[\s\S]*?(?=## 5\.)/u, '$1\n\n'),
    ],
    [
      'reflection containing only a note',
      (source: string) =>
        source.replace(
          /(## 6\.[^\n]+)\n[\s\S]*?(?=\*\*Margin note:)/u,
          '$1\n\n',
        ),
    ],
  ])('rejects %s answers', (_label, change) => {
    const data = input();
    expect(() =>
      buildPortfolio({
        ...data,
        markdown: {
          ...data.markdown,
          'analyses/odyssey.md': change(data.markdown['analyses/odyssey.md']!),
        },
      }),
    ).toThrow(/six numbered answers|Missing answer body/u);
  });

  it('validates anchors against the destination document, including same-document links', () => {
    const data = input();
    const withLink = (url: string) =>
      buildPortfolio({
        ...data,
        markdown: {
          ...data.markdown,
          'profile.md': `${data.markdown['profile.md']}\n\n[Read](${url})`,
        },
      });
    expect(() => withLink('/analyses/odyssey#odyssey-values')).not.toThrow();
    expect(() => withLink('/analyses/iliad#odyssey-values')).toThrow(
      'Anchor belongs to another document',
    );
    expect(() => withLink('#odyssey-values')).toThrow(
      'Anchor belongs to another document',
    );
  });

  it('rejects missing source, layout, image reference, and missing asset bytes', () => {
    const data = input();
    expect(() =>
      buildPortfolio({
        ...data,
        sources: data.sources.filter(({ id }) => id !== 'B5'),
      }),
    ).toThrow('Missing source B5');
    expect(() => buildPortfolio({ ...data, workLayouts: {} })).toThrow(
      'Missing opening layout',
    );
    expect(() => buildPortfolio({ ...data, images: [] })).toThrow(
      'Missing layout image jd-portrait',
    );
    expect(() => buildPortfolio({ ...data, availableAssets: [] })).toThrow(
      'Missing image asset',
    );
    expect(() => buildPortfolio({ ...data, sectionSourceIds: {} })).toThrow(
      'Missing source assignment',
    );
  });

  it.each([
    ['[Missing work](/analyses/missing)', 'Missing local destination'],
    ['[Missing anchor](#odyssey-missing)', 'Missing anchor'],
    ['![Missing portrait](/images/no-photo.jpg)', 'Missing image asset'],
    ['![Unregistered](/licenses/Patrick-Hand-OFL.txt)', 'Unregistered image'],
    ['![Remote](https://example.com/image.jpg)', 'registered local asset'],
    ['![](/images/profile/jd.jpg)', 'Missing image alt text'],
  ])('rejects unresolved local references in %s', (extra, message) => {
    const data = input();
    expect(() =>
      buildPortfolio({
        ...data,
        markdown: {
          ...data.markdown,
          'profile.md': `${data.markdown['profile.md']}\n\n${extra}`,
        },
      }),
    ).toThrow(message);
  });
});
