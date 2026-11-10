import type { LiteraryLens, WorkId } from './types';

export const profile = {
  name: 'John Daniel P. Labing',
  coverName: 'JD',
  course: 'BS Computer Science',
  year: 'Fourth Year',
  university: 'University of Nueva Caceres',
  classSection: 'Great Books-GEC-GB-NRs',
  classCode: '1560',
  contentPath: 'profile.md',
  portraitId: 'jd-portrait',
  favoriteWorkId: 'odyssey' satisfies WorkId,
  mostInfluentialLens: 'Reader-Response' satisfies LiteraryLens,
} as const;
