import type { PortfolioSection } from './types';

/** Sources and credits belong within sections, never a sixth bookmark. */
export const sections = [
  {
    id: 'student-profile',
    label: 'Student Profile',
    contentPath: 'profile.md',
  },
  {
    id: 'literary-analyses',
    label: 'Literary Analyses',
    contentPath: 'reading-list.md',
  },
  {
    id: 'favorite-masterpiece',
    label: 'Favorite Masterpiece',
    contentPath: 'favorite.md',
  },
  {
    id: 'summary-of-learning',
    label: 'Summary of Learning',
    contentPath: 'learning.md',
  },
  {
    id: 'personal-reflection',
    label: 'Personal Reflection',
    contentPath: 'reflection.md',
  },
] as const satisfies readonly PortfolioSection[];
