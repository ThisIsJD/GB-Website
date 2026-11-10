import type { WorkId } from './types';

/**
 * Book-cover photographs shown as taped polaroids on each analysis opening.
 * Files live in public/images/works and are supplied by JD for this portfolio.
 */
export const workCovers = {
  'voice-out-of-the-whirlwind': {
    src: '/images/works/voice-out-of-the-whirlwind.jpg',
    credit: 'Book cover supplied by JD for this portfolio.',
  },
  panchatantra: {
    src: '/images/works/panchatantra.jpg',
    credit: 'Book cover supplied by JD for this portfolio.',
  },
  mahabharata: {
    src: '/images/works/mahabharata.jpg',
    credit: 'Book cover supplied by JD for this portfolio.',
  },
  iliad: {
    src: '/images/works/iliad.jpg',
    credit: 'Book cover supplied by JD for this portfolio.',
  },
  odyssey: {
    src: '/images/works/odyssey.jpg',
    credit: 'Book cover supplied by JD for this portfolio.',
  },
  'tale-of-genji': {
    src: '/images/works/tale-of-genji.jpg',
    credit: 'Book cover supplied by JD for this portfolio.',
  },
  'les-miserables': {
    src: '/images/works/les-miserables.jpg',
    credit: 'Book cover supplied by JD for this portfolio.',
  },
} as const satisfies Record<WorkId, { src: string; credit: string }>;
