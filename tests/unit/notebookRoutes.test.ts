import { describe, expect, it } from 'vitest';
import {
  notebookGroups,
  notebookUrl,
  locationForTarget,
  readNotebookRoute,
} from '../../src/lib/navigation/notebookRoutes';
import { portfolio } from '../../src/lib/content/portfolio';

describe('notebook routes', () => {
  it('round trips every canonical block and continuation offset', () => {
    for (const group of notebookGroups)
      for (const block of group.blocks) {
        const location = {
          anchor: block.anchor,
          blockId: block.id,
          offset: Math.min(5, block.text.length - 1),
        };
        const url = new URL(
          notebookUrl(location, false),
          'https://notebook.test',
        );
        expect(readNotebookRoute(url.pathname, url.search)?.location).toEqual(
          location,
        );
      }
  });
  it('opens every work by slug and preserves reading mode', () => {
    for (const work of portfolio.works) {
      expect(readNotebookRoute(`/analyses/${work.slug}`, '')?.location).toEqual(
        locationForTarget(work.id),
      );
      expect(notebookUrl(locationForTarget(work.id), true)).toBe(
        `/analyses/${work.slug}?view=reading`,
      );
    }
  });
  it('recovers unknown and incompatible targets without accepting another work', () => {
    expect(readNotebookRoute('/analyses/unknown', '')).toBeNull();
    expect(readNotebookRoute('/unknown', '')).toBeNull();
    for (const at of ['missing', 'odyssey-reflection']) {
      expect(readNotebookRoute('/profile', `?at=${at}`)).toMatchObject({
        recovered: true,
        location: locationForTarget('student-profile'),
      });
    }
    expect(
      readNotebookRoute('/notebook', '?at=odyssey-reflection')?.location.anchor,
    ).toBe('odyssey-reflection');
    expect(
      readNotebookRoute('/analyses/odyssey', '?at=odyssey-reflection&offset=-1')
        ?.location.offset,
    ).toBe(0);
  });
});
