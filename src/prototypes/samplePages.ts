import samples from './fixtures/page-samples.md?raw';
import type { ReadingLeaf } from '../lib/navigation/engineProtocol';

export function samplePages(edition: number, fewer: boolean): ReadingLeaf[] {
  const entries = samples.trim().split(/\n---\n/);
  const selected = fewer
    ? entries.filter((_, index) => index !== 2 && index !== 4)
    : entries;
  return selected.map((entry, index) => {
    const [heading = '', ...body] = entry.trim().split('\n');
    return {
      id: `sample-${index}`,
      title: heading.replace(/^# /, ''),
      markdown:
        edition % 2 && index === 1
          ? 'Keep moving, but remember why you started.'
          : body.join('\n').trim(),
      anchor: `sample-${index}`,
      hard: index === 0 || index === selected.length - 1,
    };
  });
}
