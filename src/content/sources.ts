import type { SectionId, SourceId, SourceRecord, WorkId } from './types';

/** Citations and access dates imported from the companion file, not newly verified. */
export const sources = [
  {
    id: 'B1',
    kind: 'literary',
    title: 'The Bible, King James Version, Job 38',
    citation:
      '*The Bible*. King James Version. “Job 38.” *Bible Gateway*, [www.biblegateway.com/passage/?search=Job+38&version=KJV](https://www.biblegateway.com/passage/?search=Job+38&version=KJV). Accessed 8 Nov. 2026.',
    links: [
      {
        label: 'www.biblegateway.com/passage/?search=Job+38&version=KJV',
        url: 'https://www.biblegateway.com/passage/?search=Job+38&version=KJV',
      },
    ],
  },
  {
    id: 'B2',
    kind: 'literary',
    title: 'The Panchatantra',
    citation:
      "Vishnu Sharma, traditionally attributed. *The Panchatantra*. Translated by Arthur W. Ryder, University of Chicago Press, 1925. [Digital edition hosted by Frances Pritchett](https://franpritchett.com/00litlinks/panchatantra_ryder/index.html). The [author's preface](https://franpritchett.com/00litlinks/panchatantra_ryder/001authpref.pdf) contains the teaching frame. The [searchable Ryder text](https://shreevatsa.net/ryder/old/export/ryder-hertel.html) includes book 2's doves and mouse episode. Accessed 8 Nov. 2026.",
    links: [
      {
        label: 'Digital edition hosted by Frances Pritchett',
        url: 'https://franpritchett.com/00litlinks/panchatantra_ryder/index.html',
      },
      {
        label: "author's preface",
        url: 'https://franpritchett.com/00litlinks/panchatantra_ryder/001authpref.pdf',
      },
      {
        label: 'searchable Ryder text',
        url: 'https://shreevatsa.net/ryder/old/export/ryder-hertel.html',
      },
    ],
  },
  {
    id: 'B3',
    kind: 'literary',
    title: 'The Bhagavad Gita, chapter 1',
    citation:
      '*The Bhagavad Gita*. Translated by Edwin Arnold, chapter 1, “Of the Distress of Arjuna.” *Internet Sacred Text Archive*, [sacred-texts.com/hin/gita/bg01.htm](https://sacred-texts.com/hin/gita/bg01.htm). Accessed 8 Nov. 2026. This section of *The Mahabharata* supports the specific scene discussed. It is not a source for every episode of the entire epic.',
    links: [
      {
        label: 'sacred-texts.com/hin/gita/bg01.htm',
        url: 'https://sacred-texts.com/hin/gita/bg01.htm',
      },
    ],
  },
  {
    id: 'B4',
    kind: 'literary',
    title: 'The Iliad',
    citation:
      'Homer. *The Iliad*. Translated by Samuel Butler. *The Internet Classics Archive*, Massachusetts Institute of Technology. [Book 1](https://classics.mit.edu/Homer/iliad.1.i.html) and [book 24](https://classics.mit.edu/Homer/iliad.24.xxiv.html). Accessed 8 Nov. 2026.',
    links: [
      {
        label: 'Book 1',
        url: 'https://classics.mit.edu/Homer/iliad.1.i.html',
      },
      {
        label: 'book 24',
        url: 'https://classics.mit.edu/Homer/iliad.24.xxiv.html',
      },
    ],
  },
  {
    id: 'B5',
    kind: 'literary',
    title: 'The Odyssey',
    citation:
      'Homer. *The Odyssey*. Translated by Samuel Butler. *The Internet Classics Archive*, Massachusetts Institute of Technology. [Book 9](https://classics.mit.edu/Homer/odyssey.9.ix.html) and [book 24](https://classics.mit.edu/Homer/odyssey.24.xxiv.html). Accessed 8 Nov. 2026.',
    links: [
      {
        label: 'Book 9',
        url: 'https://classics.mit.edu/Homer/odyssey.9.ix.html',
      },
      {
        label: 'book 24',
        url: 'https://classics.mit.edu/Homer/odyssey.24.xxiv.html',
      },
    ],
  },
  {
    id: 'B6',
    kind: 'literary',
    title: 'The Tale of Genji, chapter 2 excerpt',
    citation:
      'Murasaki Shikibu. *The Tale of Genji*. Translated by Edward Seidensticker, Alfred A. Knopf, 1976. Chapter 2 excerpt reproduced in [“Writers of the Heian Era: Fiction, The Tale of Genji 1.”](https://chnm.gmu.edu/wwh/p/219.html) *Women in World History*, Roy Rosenzweig Center for History and New Media, George Mason University. Accessed 8 Nov. 2026. This excerpt supports the rainy-night conversation discussed here.',
    links: [
      {
        label: '“Writers of the Heian Era: Fiction, The Tale of Genji 1.”',
        url: 'https://chnm.gmu.edu/wwh/p/219.html',
      },
    ],
  },
  {
    id: 'B7',
    kind: 'literary',
    title: 'Les Misérables',
    citation:
      "Hugo, Victor. *Les Misérables*. Translated by Isabel F. Hapgood, 1887. *Project Gutenberg*, [www.gutenberg.org/files/135/135-h/135-h.htm](https://www.gutenberg.org/files/135/135-h/135-h.htm). The bishop's candlestick scene is also available in [vol. 1, book 2, chapter 12 on Wikisource](https://en.wikisource.org/wiki/Les_Mis%C3%A9rables/Volume_1/Book_Second/Chapter_12). Accessed 8 Nov. 2026.",
    links: [
      {
        label: 'www.gutenberg.org/files/135/135-h/135-h.htm',
        url: 'https://www.gutenberg.org/files/135/135-h/135-h.htm',
      },
      {
        label: 'vol. 1, book 2, chapter 12 on Wikisource',
        url: 'https://en.wikisource.org/wiki/Les_Mis%C3%A9rables/Volume_1/Book_Second/Chapter_12',
      },
    ],
  },
  {
    id: 'C1',
    kind: 'cultural',
    title: 'Mahabharata: cultural background',
    citation:
      '“Mahabharata.” *Encyclopaedia Britannica*, [www.britannica.com/topic/Mahabharata](https://www.britannica.com/topic/Mahabharata). Accessed 8 Nov. 2026. Background on the epic and dharma.',
    links: [
      {
        label: 'www.britannica.com/topic/Mahabharata',
        url: 'https://www.britannica.com/topic/Mahabharata',
      },
    ],
  },
  {
    id: 'C2',
    kind: 'cultural',
    title: 'The Tale of Genji: A Japanese Classic Illuminated',
    citation:
      '“The Tale of Genji: A Japanese Classic Illuminated.” *The Metropolitan Museum of Art*, 2019. [Exhibition galleries](https://www.metmuseum.org/exhibitions/listings/2019/tale-of-genji/exhibition-galleries), [places and people](https://www.metmuseum.org/exhibitions/listings/2019/tale-of-genji/places-and-people), and [*Genji: A Picture Album*](https://resources.metmuseum.org/resources/metpublications/pdf/Genji_A_Picture_Album.pdf). Accessed 8 Nov. 2026.',
    links: [
      {
        label: 'Exhibition galleries',
        url: 'https://www.metmuseum.org/exhibitions/listings/2019/tale-of-genji/exhibition-galleries',
      },
      {
        label: 'places and people',
        url: 'https://www.metmuseum.org/exhibitions/listings/2019/tale-of-genji/places-and-people',
      },
      {
        label: '*Genji: A Picture Album*',
        url: 'https://resources.metmuseum.org/resources/metpublications/pdf/Genji_A_Picture_Album.pdf',
      },
    ],
  },
  {
    id: 'SDG1',
    kind: 'sdg',
    title: 'Goal 1: No Poverty',
    citation:
      'United Nations, Department of Economic and Social Affairs. *Sustainable Development Goals*. Accessed 8 Nov. 2026.\n\n[Goal 1: No Poverty](https://sdgs.un.org/goals/goal1).',
    links: [
      {
        label: 'Goal 1: No Poverty',
        url: 'https://sdgs.un.org/goals/goal1',
      },
    ],
  },
  {
    id: 'SDG4',
    kind: 'sdg',
    title: 'Goal 4: Quality Education',
    citation:
      'United Nations, Department of Economic and Social Affairs. *Sustainable Development Goals*. Accessed 8 Nov. 2026.\n\n[Goal 4: Quality Education](https://sdgs.un.org/goals/goal4).',
    links: [
      {
        label: 'Goal 4: Quality Education',
        url: 'https://sdgs.un.org/goals/goal4',
      },
    ],
  },
  {
    id: 'SDG5',
    kind: 'sdg',
    title: 'Goal 5: Gender Equality',
    citation:
      'United Nations, Department of Economic and Social Affairs. *Sustainable Development Goals*. Accessed 8 Nov. 2026.\n\n[Goal 5: Gender Equality](https://sdgs.un.org/goals/goal5).',
    links: [
      {
        label: 'Goal 5: Gender Equality',
        url: 'https://sdgs.un.org/goals/goal5',
      },
    ],
  },
  {
    id: 'SDG16',
    kind: 'sdg',
    title: 'Goal 16: Peace, Justice and Strong Institutions',
    citation:
      'United Nations, Department of Economic and Social Affairs. *Sustainable Development Goals*. Accessed 8 Nov. 2026.\n\n[Goal 16: Peace, Justice and Strong Institutions](https://sdgs.un.org/goals/goal16).',
    links: [
      {
        label: 'Goal 16: Peace, Justice and Strong Institutions',
        url: 'https://sdgs.un.org/goals/goal16',
      },
    ],
  },
] as const satisfies readonly SourceRecord[];

export const workSourceNotes = {
  'voice-out-of-the-whirlwind':
    '*The Bible*, King James Version, Job 38. See source B1 and the Goal 4 link below. The Bikol comparison and SDG connection are personal interpretations.',
  panchatantra:
    'Source B2, especially the opening and book 2, and the Goal 16 link below.',
  mahabharata:
    'Source B3 for the scene in the *Bhagavad Gita*, a section of *The Mahabharata*. Source C1 supports the cultural discussion. See the Goal 16 link below.',
  iliad: 'Source B4, books 1 and 24, and the Goal 16 link below.',
  odyssey:
    'Source B5, books 9 and 24, and the Goal 16 link below. The Butler translation uses Ulysses and Minerva for Odysseus and Athena. The website uses the Greek names consistently.',
  'tale-of-genji':
    "Source B6 for the chapter 2 excerpt, C2 for court culture and art, and the Goal 5 link below. The characters' opinions in the conversation are not automatically the author's own beliefs.",
  'les-miserables':
    'Source B7, especially vol. 1, book 2, chapters 1, 3, and 12, and the Goal 1 link below.',
} as const satisfies Record<WorkId, string>;

export const sectionSourceIds = {
  'student-profile': [],
  'literary-analyses': sources.map(({ id }) => id),
  'favorite-masterpiece': ['B5'],
  'summary-of-learning': ['B4'],
  'personal-reflection': [],
} as const satisfies Record<SectionId, readonly SourceId[]>;

export const sourceContext = {
  editionDisclaimer:
    "The following entries use MLA-style author, title, translation, container, and location details where available. Chapter, book, and verse references replace invented page numbers. The references identify the editions used to check these drafts. They do not claim that JD's class used the same editions.",
  sdgDisclaimer:
    'These are present-day connections made by the student. Ancient works did not refer to the United Nations goals.',
} as const;
