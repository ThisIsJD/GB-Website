import type { PortfolioSection, SourceRecord, Work } from '../../content/types';
import { parseMarkdown } from './parseMarkdown';
import { validatePortfolio } from './validatePortfolio';
import { answerKeys, ContentValidationError } from './types';
import type {
  CanonicalPortfolio,
  ContentDocument,
  ContentImage,
  OpeningLayout,
} from './types';

export interface PortfolioInput {
  sections: readonly PortfolioSection[];
  works: readonly Work[];
  sources: readonly SourceRecord[];
  images: readonly ContentImage[];
  markdown: Readonly<Record<string, string>>;
  availableAssets: readonly string[];
  sectionSourceIds: Readonly<Record<string, readonly string[]>>;
  sectionLayouts: Readonly<Record<string, OpeningLayout>>;
  workLayouts: Readonly<Record<string, OpeningLayout>>;
  workSourceNotes: Readonly<Record<string, string>>;
  favoriteWorkId: string;
  portraitId: string;
}

/** Pure construction, shared by Vite's loader and repository validation tests. */
export function buildPortfolio(input: PortfolioInput): CanonicalPortfolio {
  const issues: string[] = [];
  const read = (path: string) => {
    const source = input.markdown[path];
    if (!source?.trim()) issues.push(`Missing or empty Markdown: ${path}`);
    if (path.includes('..') || path.startsWith('/'))
      issues.push(`Invalid content path: ${path}`);
    return source ?? '';
  };
  const layout = (id: string, layouts: PortfolioInput['sectionLayouts']) => {
    const found = layouts[id];
    if (!found) issues.push(`Missing opening layout: ${id}`);
    return found ?? { key: 'work-opening' as const, imageIds: [] };
  };
  const sections = input.sections.map((section, order) => {
    if (!Object.hasOwn(input.sectionSourceIds, section.id))
      issues.push(`Missing source assignment: ${section.id}`);
    return {
      ...section,
      order,
      layout: layout(section.id, input.sectionLayouts),
      sourceIds: input.sectionSourceIds[section.id] ?? [],
    };
  });
  const works = input.works.map((work, order) => {
    const note = input.workSourceNotes[work.id];
    if (!note?.trim()) issues.push(`Missing source note: ${work.id}`);
    return {
      ...work,
      order,
      layout: layout(work.id, input.workLayouts),
      sourceNote: parseMarkdown(note ?? '', {
        documentId: `${work.id}-source-note`,
      }),
    };
  });
  const documents: ContentDocument[] = [
    ...sections.map((section) => ({
      id: section.id,
      sectionId: section.id,
      title: section.label,
      contentPath: section.contentPath,
      blocks: parseMarkdown(read(section.contentPath), {
        documentId: section.id,
      }),
      answers: [],
    })),
    ...works.map((work) => {
      const blocks = parseMarkdown(read(work.contentPath), {
        documentId: work.id,
        analysis: true,
      });
      return {
        id: work.id,
        sectionId: 'literary-analyses' as const,
        workId: work.id,
        title: work.title,
        contentPath: work.contentPath,
        blocks,
        answers: answerKeys.map((key) => {
          const anchor = `${work.id}-${key}`;
          return {
            key,
            anchor,
            blockIds: blocks
              .filter((block) => block.anchor === anchor)
              .map(({ id }) => id),
          };
        }),
      };
    }),
  ];
  const portfolio: CanonicalPortfolio = {
    sections,
    works,
    images: input.images,
    documents,
    sources: input.sources.map((source) => ({
      ...source,
      blocks: parseMarkdown(source.citation, {
        documentId: `source-${source.id.toLowerCase()}`,
        role: 'source-entry',
      }),
    })),
  };
  issues.push(...validatePortfolio(portfolio, input));
  if (issues.length) throw new ContentValidationError(issues);
  return portfolio;
}
