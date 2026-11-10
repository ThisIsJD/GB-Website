import type { Blockquote, Heading, List, Paragraph } from 'mdast';
import type {
  PortfolioSection,
  SectionId,
  SourceRecord,
  Work,
  WorkId,
} from '../../content/types';

export const answerKeys = [
  'lens',
  'values',
  'civilization',
  'bikol',
  'contemporary',
  'reflection',
] as const;
export type AnswerKey = (typeof answerKeys)[number];
export type ContentNode = Heading | Paragraph | List | Blockquote;
export type LayoutKey =
  | 'profile'
  | 'reading-contents'
  | 'work-opening'
  | 'favorite'
  | 'learning'
  | 'reflection';

export interface OpeningLayout {
  key: LayoutKey;
  imageIds: readonly string[];
}

export interface ContentImage {
  id: string;
  kind: 'portrait' | 'illustration' | 'doodle';
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit: string;
}

export interface ContentBlock {
  id: string;
  documentId: string;
  anchor: string;
  order: number;
  kind: ContentNode['type'];
  role: 'writing' | 'source-entry';
  node: ContentNode;
  /** Selectable text, not Markdown delimiters. Offsets use Unicode code points. */
  text: string;
}

export interface ContentDocument {
  id: string;
  sectionId: SectionId;
  workId?: WorkId;
  title: string;
  contentPath: string;
  blocks: readonly ContentBlock[];
  answers: readonly {
    key: AnswerKey;
    anchor: string;
    blockIds: readonly string[];
  }[];
}

export interface ContentSection extends PortfolioSection {
  order: number;
  layout: OpeningLayout;
  sourceIds: readonly string[];
}

export interface ContentWork extends Work {
  order: number;
  layout: OpeningLayout;
  sourceNote: readonly ContentBlock[];
}

export interface ContentSource extends SourceRecord {
  blocks: readonly ContentBlock[];
}

export interface CanonicalPortfolio {
  sections: readonly ContentSection[];
  works: readonly ContentWork[];
  sources: readonly ContentSource[];
  images: readonly ContentImage[];
  documents: readonly ContentDocument[];
}

export class ContentValidationError extends Error {
  constructor(public readonly issues: readonly string[]) {
    super(`Invalid portfolio content:\n${issues.join('\n')}`);
    this.name = 'ContentValidationError';
  }
}
