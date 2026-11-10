import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const windowSelector = '.measured-window';
type Range = { blockId: string; anchor: string; from: number; to: number };

async function ready(page: Page) {
  await expect(page.locator(windowSelector)).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: 25000 },
  );
}
async function choose(page: Page, index: number) {
  await page
    .getByRole('combobox', { name: 'Go to page', exact: true })
    .selectOption(String(index));
  const spread =
    (await page.locator(windowSelector).getAttribute('data-mode')) ===
    'landscape';
  const count = Number(
    await page.locator(windowSelector).getAttribute('data-page-count'),
  );
  const normalized =
    spread && index > 0 && index < count - 1 && index % 2 === 0
      ? index - 1
      : index;
  await expect(page.locator(windowSelector)).toHaveAttribute(
    'data-page-index',
    String(normalized),
  );
  await expect(
    page.getByRole('combobox', { name: 'Go to page', exact: true }),
  ).toBeEnabled();
}
async function visibleRanges(page: Page): Promise<Range[]> {
  return page
    .frameLocator('iframe')
    .locator('.page-leaf[aria-hidden="false"][data-source-ranges]')
    .evaluateAll((elements) =>
      elements.flatMap(
        (element) =>
          JSON.parse(element.getAttribute('data-source-ranges')!) as Range[],
      ),
    );
}
async function sourceText(page: Page) {
  await page
    .getByRole('button', { name: 'Read without page turns', exact: true })
    .click();
  const text = await page
    .locator('.full-reading .reading-content')
    .textContent();
  await page
    .getByRole('button', { name: 'Back to notebook', exact: true })
    .click();
  await ready(page);
  return text!.replace(/\s/gu, '');
}
async function conservation(page: Page, expected: string) {
  const leaves = await page
    .frameLocator('iframe')
    .locator('.page-leaf[data-source-ranges]')
    .evaluateAll((elements) => {
      const unique = new Map<
        string,
        { id: string; text: string; ranges: Range[] }
      >();
      for (const element of elements) {
        const id = element.getAttribute('data-leaf-id')!;
        unique.set(id, {
          id,
          text: element.querySelector('.reading-content')!.textContent ?? '',
          ranges: JSON.parse(
            element.getAttribute('data-source-ranges')!,
          ) as Range[],
        });
      }
      return Array.from(unique.values());
    });
  expect(
    leaves
      .map((leaf) => leaf.text)
      .join('')
      .replace(/\s/gu, ''),
  ).toBe(expected);
  const offsets = new Map<string, number>();
  for (const leaf of leaves)
    for (const range of leaf.ranges) {
      expect(range.from).toBe(offsets.get(range.blockId) ?? 0);
      expect(range.to).toBeGreaterThan(range.from);
      offsets.set(range.blockId, range.to);
    }
  return leaves;
}
async function checkAllLeaves(page: Page, fontSize: number) {
  const count = Number(
    await page.locator(windowSelector).getAttribute('data-page-count'),
  );
  const seen = new Set<string>();
  for (let index = 1; index < count - 1; index++) {
    await choose(page, index);
    const checks = await page
      .frameLocator('iframe')
      .locator('.page-leaf[aria-hidden="false"][data-source-ranges]')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const body = element.querySelector<HTMLElement>('.leaf-body')!;
          const content = body.firstElementChild!;
          const header = element.querySelector('.leaf-header')!;
          const footer = element.querySelector('.leaf-footer')!;
          return {
            id: element.getAttribute('data-leaf-id')!,
            clipped:
              body.scrollHeight > body.clientHeight ||
              content.getBoundingClientRect().bottom >
                body.getBoundingClientRect().bottom + 0.5,
            horizontal: content.scrollWidth > body.clientWidth,
            font: parseFloat(getComputedStyle(content).fontSize),
            overlap:
              header.getBoundingClientRect().bottom >
                body.getBoundingClientRect().top ||
              body.getBoundingClientRect().bottom >
                footer.getBoundingClientRect().top + 0.5,
            orphan: content.lastElementChild?.tagName === 'H2',
          };
        }),
      );
    for (const check of checks) {
      seen.add(check.id);
      expect(check, JSON.stringify(check)).toMatchObject({
        clipped: false,
        horizontal: false,
        overlap: false,
        orphan: false,
        font: fontSize,
      });
    }
  }
  return seen.size;
}

test('real longest-title analysis and stress writing conserve all text on every visible leaf', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/prototype/analysis');
  await ready(page);
  const original = await sourceText(page);
  expect(original).toContain('My main lens is'.replace(/\s/gu, ''));
  await conservation(page, original);
  await page.getByLabel('Include a long reading exercise').check();
  await expect(
    page.getByText('Answer 7 is a layout exercise', { exact: false }),
  ).toBeVisible();
  await expect(page.locator(windowSelector)).toHaveAttribute(
    'data-revision',
    /2-/,
  );
  await ready(page);
  const expected = await sourceText(page);
  const widths =
    testInfo.project.name === 'desktop-chromium'
      ? [320, 768, 1024, 1440]
      : [390];
  const evidence = [];
  for (const width of widths) {
    const before = await page
      .locator(windowSelector)
      .getAttribute('data-revision');
    const previousWidth = page.viewportSize()!.width;
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 });
    if (previousWidth !== width) {
      // Widths above 928 share the same capped physical leaf geometry.
      if (!(previousWidth >= 928 && width >= 928))
        await expect(page.locator(windowSelector)).not.toHaveAttribute(
          'data-revision',
          before!,
          { timeout: 25000 },
        );
    }
    await ready(page);
    const leaves = await conservation(page, expected);
    const frameWidth = Number(
      await page.locator('iframe').getAttribute('width'),
    );
    const spread =
      (await page.locator(windowSelector).getAttribute('data-mode')) ===
      'landscape';
    const leafWidth = frameWidth / (spread ? 2 : 1);
    const font = leafWidth < 340 ? 19 : 20;
    expect(await checkAllLeaves(page, font)).toBe(leaves.length);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await choose(page, 1);
    await mkdir('.cache/screenshots', { recursive: true });
    await page.locator('iframe').screenshot({
      path:
        '.cache/screenshots/p2.4-' +
        width +
        '-' +
        testInfo.project.name +
        '.png',
    });
    evidence.push({ width, leaves: leaves.length, font });
  }
  await mkdir('.cache/evidence', { recursive: true });
  await writeFile(
    `.cache/evidence/p2.4-pagination-${testInfo.project.name}.json`,
    JSON.stringify(evidence, null, 2),
  );
});

test('resize restores the same answer and the same oversized-paragraph location', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/prototype/analysis');
  await ready(page);
  await page
    .getByRole('combobox', { name: 'Go to answer', exact: true })
    .selectOption('answer-6');
  await expect
    .poll(async () =>
      (await visibleRanges(page)).some((part) => part.anchor === 'answer-6'),
    )
    .toBe(true);
  let before = await page.locator(windowSelector).getAttribute('data-revision');
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(page.locator(windowSelector)).not.toHaveAttribute(
    'data-revision',
    before!,
    { timeout: 25000 },
  );
  await ready(page);
  expect(
    (await visibleRanges(page)).some((part) => part.anchor === 'answer-6'),
  ).toBe(true);
  before = await page.locator(windowSelector).getAttribute('data-revision');
  await page.getByLabel('Include a long reading exercise').check();
  await expect(page.locator(windowSelector)).not.toHaveAttribute(
    'data-revision',
    before!,
    { timeout: 25000 },
  );
  await ready(page);
  const target = await page
    .frameLocator('iframe')
    .locator('.page-leaf[data-source-ranges]')
    .evaluateAll((elements) => {
      for (const element of elements) {
        const ranges = JSON.parse(
          element.getAttribute('data-source-ranges')!,
        ) as Range[];
        const part = ranges.find(
          (range) => range.anchor === 'answer-7' && range.from > 100,
        );
        if (part)
          return {
            index: Number(
              element.getAttribute('data-leaf-id')!.split('-').at(-1),
            ),
            part,
          };
      }
      return null;
    });
  expect(target).not.toBeNull();
  await choose(page, target!.index);
  const reference = (await visibleRanges(page)).find(
    (part) => part.blockId === target!.part.blockId,
  )!;
  before = await page.locator(windowSelector).getAttribute('data-revision');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(windowSelector)).not.toHaveAttribute(
    'data-revision',
    before!,
    { timeout: 25000 },
  );
  await ready(page);
  expect(
    (await visibleRanges(page)).some(
      (part) =>
        part.blockId === reference.blockId &&
        part.from <= reference.from &&
        part.to > reference.from,
    ),
  ).toBe(true);
  before = await page.locator(windowSelector).getAttribute('data-revision');
  await page.getByLabel('Larger handwriting').check();
  await expect(page.locator(windowSelector)).not.toHaveAttribute(
    'data-revision',
    before!,
    { timeout: 25000 },
  );
  await ready(page);
  expect(
    (await visibleRanges(page)).some(
      (part) =>
        part.blockId === reference.blockId &&
        part.from <= reference.from &&
        part.to > reference.from,
    ),
  ).toBe(true);
  await checkAllLeaves(page, 24);
});

test('the Odyssey fixture, keyboard focus, and physical curl remain available', async ({
  page,
}) => {
  await page.goto('/prototype/analysis');
  await ready(page);
  await page.getByLabel('Choose a work').selectOption('odyssey');
  await expect(page.locator(windowSelector)).toHaveAttribute(
    'data-revision',
    /2-/,
  );
  await ready(page);
  const expected = await sourceText(page);
  await conservation(page, expected);
  await page
    .getByRole('combobox', { name: 'Go to answer', exact: true })
    .selectOption('answer-6');
  await expect(
    page.frameLocator('iframe').locator('.leaf-header:focus'),
  ).toHaveText('The Odyssey');
  expect(
    (await visibleRanges(page)).some((part) => part.anchor === 'answer-6'),
  ).toBe(true);
  await page
    .getByRole('button', { name: 'Previous page', exact: true })
    .click();
  await expect(page.locator(windowSelector)).toHaveAttribute(
    'data-engine-state',
    'flipping',
  );
  await expect(
    page
      .frameLocator('iframe')
      .locator('[class*="stf__hardShadow"], [class*="stf__outerShadow"]')
      .first(),
  ).toBeAttached();
  await expect(
    page.getByRole('combobox', { name: 'Go to page', exact: true }),
  ).toBeEnabled();
});

test('font and engine failures expose complete writing without clipped pages', async ({
  page,
}) => {
  await page.route('**/*.woff*', (route) => route.abort());
  await page.goto('/prototype/analysis');
  await expect(page.getByRole('alert')).toContainText('complete writing', {
    timeout: 25000,
  });
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.full-reading')).toContainText(
    'Some questions take time.',
  );
  await expect(page.locator('.page-measurement')).toHaveCount(0);
  await page.unroute('**/*.woff*');
  await page.route('**/turning-pages.html', (route) => route.abort());
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('complete writing', {
    timeout: 25000,
  });
  await expect(page.locator('.full-reading')).toContainText(
    'Some questions take time.',
  );
});
