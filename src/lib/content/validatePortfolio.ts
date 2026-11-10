import type { Nodes } from 'mdast';
import { isSafeContentUrl } from './parseMarkdown';
import { answerKeys } from './types';
import type { CanonicalPortfolio, ContentBlock } from './types';

interface ValidationContext {
  availableAssets: readonly string[];
  favoriteWorkId: string;
  portraitId: string;
}

const requiredSections = [
  ['student-profile', 'Student Profile'],
  ['literary-analyses', 'Literary Analyses'],
  ['favorite-masterpiece', 'Favorite Masterpiece'],
  ['summary-of-learning', 'Summary of Learning'],
  ['personal-reflection', 'Personal Reflection'],
] as const;
const requiredWorks = [
  'voice-out-of-the-whirlwind',
  'panchatantra',
  'mahabharata',
  'iliad',
  'odyssey',
  'tale-of-genji',
  'les-miserables',
];
const layoutKeys = new Set([
  'profile',
  'reading-contents',
  'work-opening',
  'favorite',
  'learning',
  'reflection',
]);

export function validatePortfolio(
  portfolio: CanonicalPortfolio,
  context: ValidationContext,
): string[] {
  const issues: string[] = [];
  function unique(values: readonly string[], label: string) {
    const seen = new Set<string>();
    for (const value of values) {
      if (seen.has(value)) issues.push(`Duplicate ${label}: ${value}`);
      seen.add(value);
    }
    return seen;
  }
  const sectionIds = unique(
    portfolio.sections.map(({ id }) => id),
    'section ID',
  );
  const workIds = unique(
    portfolio.works.map(({ id }) => id),
    'work ID',
  );
  unique(
    portfolio.works.map(({ slug }) => slug),
    'work slug',
  );
  unique(
    portfolio.documents.map(({ id }) => id),
    'document ID',
  );
  const sourceIds = unique(
    portfolio.sources.map(({ id }) => id),
    'source ID',
  );
  const imageIds = unique(
    portfolio.images.map(({ id }) => id),
    'image ID',
  );
  const assets = new Set(context.availableAssets);
  const blocks = [
    ...portfolio.documents.flatMap(({ blocks }) => blocks),
    ...portfolio.sources.flatMap(({ blocks }) => blocks),
    ...portfolio.works.flatMap(({ sourceNote }) => sourceNote),
  ];
  const blockIds = unique(
    blocks.map(({ id }) => id),
    'block ID',
  );
  const anchors = new Set(blocks.map(({ anchor }) => anchor));
  if (!workIds.has(context.favoriteWorkId))
    issues.push(`Missing favorite work: ${context.favoriteWorkId}`);
  if (!imageIds.has(context.portraitId))
    issues.push(`Missing portrait: ${context.portraitId}`);
  if (portfolio.sections.length !== 5) issues.push('Expected five sections');
  if (portfolio.works.length !== 7) issues.push('Expected seven works');
  if (portfolio.documents.length !== 12)
    issues.push('Expected twelve writing documents');
  requiredSections.forEach(([id, label], index) => {
    if (
      portfolio.sections[index]?.id !== id ||
      portfolio.sections[index]?.label !== label
    )
      issues.push(`Section ${index + 1} must be ${label} (${id})`);
  });
  requiredWorks.forEach((id, index) => {
    if (portfolio.works[index]?.id !== id)
      issues.push(`Work ${index + 1} must be ${id}`);
  });

  const routes = new Set([
    '/',
    '/profile',
    '/analyses',
    '/favorite',
    '/learning',
    '/reflection',
    ...portfolio.works.map(({ slug }) => `/analyses/${slug}`),
  ]);
  const routeDocuments = new Map([
    ['/profile', 'student-profile'],
    ['/analyses', 'literary-analyses'],
    ['/favorite', 'favorite-masterpiece'],
    ['/learning', 'summary-of-learning'],
    ['/reflection', 'personal-reflection'],
    ...portfolio.works.map(({ slug, id }): [string, string] => [
      `/analyses/${slug}`,
      id,
    ]),
  ]);
  function checkUrl(
    url: string,
    label: string,
    image = false,
    ownerId?: string,
  ) {
    if (!isSafeContentUrl(url)) {
      issues.push(`Invalid URL in ${label}: ${url}`);
      return;
    }
    if (image && !url.startsWith('/')) {
      issues.push(`Image must use a registered local asset: ${url}`);
      return;
    }
    if (!url.startsWith('/') && !url.startsWith('#')) return;
    try {
      const parsed = new URL(url, 'https://portfolio.invalid');
      const path = decodeURIComponent(parsed.pathname);
      if (image) {
        if (!assets.has(path))
          issues.push(`Missing image asset in ${label}: ${path}`);
        if (!portfolio.images.some(({ src }) => src === path))
          issues.push(`Unregistered image in ${label}: ${path}`);
      } else if (!routes.has(path) && !assets.has(path))
        issues.push(`Missing local destination in ${label}: ${path}`);
      const anchor = decodeURIComponent(parsed.hash.slice(1));
      if (anchor && !blockIds.has(anchor) && !anchors.has(anchor))
        issues.push(`Missing anchor in ${label}: ${anchor}`);
      if (anchor && !image) {
        const documentId = url.startsWith('#')
          ? ownerId
          : routeDocuments.get(path);
        if (
          documentId &&
          !blocks.some(
            (block) =>
              block.documentId === documentId &&
              (block.id === anchor || block.anchor === anchor),
          )
        )
          issues.push(
            `Anchor belongs to another document in ${label}: ${anchor}`,
          );
      }
    } catch {
      issues.push(`Invalid local URL in ${label}: ${url}`);
    }
  }
  function checkNode(node: Nodes, block: ContentBlock) {
    if (node.type === 'link' || node.type === 'image') {
      checkUrl(node.url, block.id, node.type === 'image', block.documentId);
      if (node.type === 'image' && !node.alt?.trim())
        issues.push(`Missing image alt text: ${block.id}`);
    }
    if ('children' in node)
      node.children.forEach((child) => checkNode(child, block));
  }
  blocks.forEach((block) => checkNode(block.node, block));
  for (const item of [...portfolio.sections, ...portfolio.works]) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(item.id))
      issues.push(`Invalid ID: ${item.id}`);
    if ('slug' in item && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(item.slug))
      issues.push(`Invalid slug: ${item.slug}`);
    if (!layoutKeys.has(item.layout.key))
      issues.push(`Invalid layout: ${item.id}`);
    item.sourceIds.forEach((id) => {
      if (!sourceIds.has(id)) issues.push(`Missing source ${id} in ${item.id}`);
    });
    item.layout.imageIds.forEach((id) => {
      if (!imageIds.has(id))
        issues.push(`Missing layout image ${id} in ${item.id}`);
    });
    const document = portfolio.documents.find(({ id }) => id === item.id);
    if (!document?.blocks.length)
      issues.push(`Missing writing document: ${item.id}`);
  }
  for (const image of portfolio.images) {
    checkUrl(image.src, image.id, true);
    if (
      !image.alt.trim() ||
      !image.credit.trim() ||
      !(image.width > 0) ||
      !(image.height > 0)
    )
      issues.push(`Incomplete image metadata: ${image.id}`);
  }
  for (const source of portfolio.sources) {
    if (!source.blocks.length || !source.links.length)
      issues.push(`Incomplete source: ${source.id}`);
    source.links.forEach(({ url }) => checkUrl(url, source.id));
  }
  for (const document of portfolio.documents) {
    if (!sectionIds.has(document.sectionId))
      issues.push(`Missing section for ${document.id}`);
    if (document.workId && !workIds.has(document.workId))
      issues.push(`Missing work for ${document.id}`);
    document.blocks.forEach((block, order) => {
      if (block.order !== order || block.documentId !== document.id)
        issues.push(`Invalid block order/owner: ${block.id}`);
    });
    if (!document.workId) continue;
    const headings = document.blocks.filter(
      ({ node }) => node.type === 'heading' && node.depth === 2,
    );
    if (
      headings.length !== 6 ||
      headings.some(({ text }, index) => !text.startsWith(`${index + 1}. `))
    )
      issues.push(
        `Analysis ${document.id} needs six numbered answers in order`,
      );
    for (const key of answerKeys) {
      const anchor = `${document.id}-${key}`;
      const answer = document.answers.find((answer) => answer.key === key);
      const body = document.blocks.filter(
        (block) => block.anchor === anchor && block.kind !== 'heading',
      );
      if (
        !answer ||
        answer.anchor !== anchor ||
        !body.some(
          ({ text }) => text.trim() && !/^(?:Margin|Closing) note:/u.test(text),
        )
      )
        issues.push(`Missing answer body: ${anchor}`);
      const actual = document.blocks
        .filter((block) => block.anchor === anchor)
        .map(({ id }) => id);
      if (JSON.stringify(answer?.blockIds) !== JSON.stringify(actual))
        issues.push(`Invalid answer map: ${anchor}`);
    }
  }
  return issues;
}
