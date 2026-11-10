export type LiteraryLens =
  | 'Formalist'
  | 'Reader-Response'
  | 'Structuralist'
  | 'Archetypal'
  | 'Historical'
  | 'Psychoanalytic'
  | 'Feminist'
  | 'Marxist';

export type SectionId =
  | 'student-profile'
  | 'literary-analyses'
  | 'favorite-masterpiece'
  | 'summary-of-learning'
  | 'personal-reflection';

export type WorkId =
  | 'voice-out-of-the-whirlwind'
  | 'panchatantra'
  | 'mahabharata'
  | 'iliad'
  | 'odyssey'
  | 'tale-of-genji'
  | 'les-miserables';

export type SourceId =
  | 'B1'
  | 'B2'
  | 'B3'
  | 'B4'
  | 'B5'
  | 'B6'
  | 'B7'
  | 'C1'
  | 'C2'
  | 'SDG1'
  | 'SDG4'
  | 'SDG5'
  | 'SDG16';

export interface SourceRecord {
  id: SourceId;
  kind: 'literary' | 'cultural' | 'sdg';
  title: string;
  citation: string;
  links: readonly { label: string; url: string }[];
}

export interface Work {
  id: WorkId;
  slug: WorkId;
  title: string;
  attribution: {
    kind: 'author' | 'traditional';
    name: string;
  };
  mainLens: LiteraryLens;
  supportingLens: LiteraryLens | null;
  /** Relative to src/content, independent of routes and physical pages. */
  contentPath: `analyses/${WorkId}.md`;
  sourceIds: readonly SourceId[];
}

export interface PortfolioSection {
  id: SectionId;
  label: string;
  contentPath: string;
}
