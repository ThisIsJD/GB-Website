import type { SectionId, WorkId } from './types';
import type { OpeningLayout } from '../lib/content/types';

/** Placement keys only. Decorated compositions and consumed blocks belong to P4.3. */
export const sectionLayouts = {
  'student-profile': { key: 'profile', imageIds: ['jd-portrait'] },
  'literary-analyses': { key: 'reading-contents', imageIds: [] },
  'favorite-masterpiece': { key: 'favorite', imageIds: [] },
  'summary-of-learning': { key: 'learning', imageIds: [] },
  'personal-reflection': { key: 'reflection', imageIds: [] },
} as const satisfies Record<SectionId, OpeningLayout>;

export const workLayouts = {
  'voice-out-of-the-whirlwind': { key: 'work-opening', imageIds: [] },
  panchatantra: { key: 'work-opening', imageIds: [] },
  mahabharata: { key: 'work-opening', imageIds: [] },
  iliad: { key: 'work-opening', imageIds: [] },
  odyssey: { key: 'work-opening', imageIds: [] },
  'tale-of-genji': { key: 'work-opening', imageIds: [] },
  'les-miserables': { key: 'work-opening', imageIds: [] },
} as const satisfies Record<WorkId, OpeningLayout>;
