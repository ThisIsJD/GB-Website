import odyssey from './fixtures/odyssey.md?raw';
import job from './fixtures/voice-out-of-the-whirlwind.md?raw';

export const analysisSamples = [
  {
    id: 'voice-out-of-the-whirlwind',
    title: 'Voice Out of the Whirlwind, Job 38',
    markdown: job,
  },
  { id: 'odyssey', title: 'The Odyssey', markdown: odyssey },
];
export const exerciseUrl =
  'https://example.org/reading-notebook/' +
  'long-source-address-for-wrapping-'.repeat(16) +
  'notes?chapter=38&view=reading';
const sentence =
  'This reading exercise checks that a long paragraph can continue on another page. Its words must stay in order, and the handwriting must remain easy to read. ';
export const readingExercise =
  '\n\n## 7. Reading exercise\n\n' +
  sentence.repeat(24) +
  '\n\nSource address for this layout exercise: [' +
  exerciseUrl +
  '](' +
  exerciseUrl +
  ').\n';
