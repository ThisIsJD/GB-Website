import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const main = '.canonical-pagination';
async function ready(page: Page) {
  await expect(page.locator(main)).toHaveAttribute('data-ready', 'true', {
    timeout: 25000,
  });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
}

async function conservation(page: Page) {
  const original = await page
    .locator('.canonical-original .reading-content')
    .textContent();
  const writing = await page
    .locator('.canonical-leaf .leaf-body .reading-content')
    .allTextContents();
  const compact = (text: string) => text.replace(/\s/gu, '');
  expect(compact(writing.join(''))).toBe(compact(original!));
  const ranges = await page
    .locator('.canonical-leaf .page-leaf')
    .evaluateAll((elements) =>
      elements.flatMap(
        (element) =>
          JSON.parse(element.getAttribute('data-source-ranges')!) as {
            blockId: string;
            from: number;
            to: number;
          }[],
      ),
    );
  const offsets = new Map<string, number>();
  const finished = new Set<string>();
  let previous = '';
  for (const range of ranges) {
    expect(range.from).toBe(offsets.get(range.blockId) ?? 0);
    expect(range.to).toBeGreaterThan(range.from);
    if (range.blockId !== previous) {
      expect(finished.has(range.blockId)).toBe(false);
      if (previous) finished.add(previous);
      previous = range.blockId;
    }
    offsets.set(range.blockId, range.to);
  }
}

async function layout(page: Page, expectedFont?: number) {
  const checks = await page
    .locator('.canonical-leaf .page-leaf')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const body = element.querySelector<HTMLElement>('.leaf-body')!;
        const content = body.querySelector<HTMLElement>('.reading-content')!;
        const header = element.querySelector('.leaf-header')!;
        const footer = element.querySelector('.leaf-footer')!;
        const box = body.getBoundingClientRect();
        return {
          id: element.getAttribute('data-leaf-id'),
          font: parseFloat(getComputedStyle(content).fontSize),
          clipped:
            body.scrollHeight > body.clientHeight ||
            content.getBoundingClientRect().bottom > box.bottom + 0.5,
          horizontal: content.scrollWidth > body.clientWidth,
          overlap:
            header.getBoundingClientRect().bottom > box.top ||
            box.bottom > footer.getBoundingClientRect().top + 0.5,
          orphan: /^H[1-6]$/u.test(content.lastElementChild?.tagName ?? ''),
          images: Array.from(content.querySelectorAll('img')).every(
            (image) =>
              image.complete &&
              image.naturalWidth > 0 &&
              image.getBoundingClientRect().width <= box.width + 0.5,
          ),
        };
      }),
    );
  expect(checks.length).toBeGreaterThan(0);
  for (const check of checks) {
    expect(check, JSON.stringify(check)).toMatchObject({
      clipped: false,
      horizontal: false,
      overlap: false,
      orphan: false,
      images: true,
    });
    if (expectedFont) expect(check.font).toBe(expectedFont);
    else expect(check.font).toBeGreaterThanOrEqual(19);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  return checks.length;
}

test('all seven canonical analyses and their real citations fit and conserve every rendered word', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto('/prototype/content');
  await ready(page);
  const select = page.getByLabel('Choose a work');
  const values = await select
    .locator('option')
    .evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
  expect(values).toHaveLength(7);
  for (const value of values) {
    await select.selectOption(value);
    await ready(page);
    await conservation(page);
    await layout(page);
  }
});

test('long paragraphs, lists, quotations, URLs and an image fit at phone and spread widths', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto('/prototype/content');
  await ready(page);
  await page.getByLabel('Include a layout exercise').check();
  await ready(page);
  const evidence = [];
  const widths =
    info.project.name === 'desktop-chromium' ? [320, 768, 1024, 1440] : [390];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    // Wait for the review harness's debounced width observer to settle.
    await expect
      .poll(async () =>
        Number(
          await page
            .locator('.canonical-leaf')
            .first()
            .evaluate((element) => element.getBoundingClientRect().width),
        ),
      )
      .toBe(
        width < 728
          ? Math.min(440, width - 48)
          : Math.min(440, Math.floor(Math.min(width - 48, 880) / 2)),
      );
    await ready(page);
    await conservation(page);
    const count = await layout(page, width === 320 ? 19 : 20);
    expect(await page.locator('.canonical-leaf ol').count()).toBeGreaterThan(1);
    expect(
      await page.locator('.canonical-leaf blockquote').count(),
    ).toBeGreaterThan(1);
    await expect(page.locator('.canonical-leaf img')).toHaveCount(1);
    evidence.push({ width, count });
    if (width === 320 || width === 1024) {
      await mkdir('resource/work/P4/P4.2', { recursive: true });
      await page
        .locator('.canonical-leaf')
        .first()
        .screenshot({
          path: `resource/work/P4/P4.2/${width === 320 ? 'phone' : 'desktop'}.png`,
        });
      if (width === 320)
        await page
          .locator('.canonical-leaf')
          .filter({ has: page.locator('ol') })
          .nth(1)
          .screenshot({ path: 'resource/work/P4/P4.2/list-phone.png' });
    }
  }
  await mkdir('.cache/evidence', { recursive: true });
  await writeFile(
    `.cache/evidence/p4.2-${info.project.name}.json`,
    JSON.stringify(evidence, null, 2),
  );
});

test('24 px handwriting, cancelled rebuilds and keyboard controls retain complete writing', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/prototype/content');
  await ready(page);
  await page.getByLabel('Include a layout exercise').check();
  await page.getByLabel('Larger handwriting').check();
  await page.getByLabel('Choose a work').selectOption('odyssey');
  await page.getByLabel('Choose a work').selectOption('les-miserables');
  await page.setViewportSize({ width: 320, height: 568 });
  await ready(page);
  await expect(page.locator('.canonical-leaf .leaf-header').first()).toHaveText(
    'Les Misérables',
  );
  await conservation(page);
  await layout(page, 24);
  await page.locator('.canonical-original summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.canonical-original')).toHaveAttribute('open', '');
  await expect(page.locator('.canonical-original article')).toContainText(
    'My main lens is',
  );
});

test('font failure exposes original writing and leaves no measurement root', async ({
  page,
}) => {
  await page.route('**/*.woff*', (route) => route.abort());
  await page.goto('/prototype/content');
  await expect(page.getByRole('alert')).toContainText('complete writing', {
    timeout: 25000,
  });
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
  await page.locator('.canonical-original summary').click();
  await expect(page.locator('.canonical-original article')).toContainText(
    'Some questions take time.',
  );
});

test('image failure is controlled and a subsequent selection recovers', async ({
  page,
}) => {
  await page.goto('/prototype/content');
  await ready(page);
  await page.route('**/images/profile/jd.jpg', (route) => route.abort());
  await page.getByLabel('Include a layout exercise').check();
  await expect(page.getByRole('alert')).toContainText('complete writing', {
    timeout: 25000,
  });
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
  await page.getByLabel('Include a layout exercise').uncheck();
  await ready(page);
  await conservation(page);
});

test('a stalled font wait times out and preserves complete writing', async ({
  page,
}) => {
  test.setTimeout(30000);
  await page.addInitScript(() => {
    Object.defineProperty(document, 'fonts', {
      value: { load: () => new Promise(() => {}), ready: Promise.resolve() },
    });
  });
  await page.goto('/prototype/content');
  await expect(page.getByRole('alert')).toContainText('complete writing', {
    timeout: 22000,
  });
  await expect(page.locator(main)).toHaveAttribute('data-error', /timed out/u);
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
  await page.locator('.canonical-original summary').click();
  await expect(page.locator('.canonical-original article')).toContainText(
    'Some questions take time.',
  );
});

test('changed image dimensions fail clearly before measurement', async ({
  page,
}) => {
  await page.goto('/prototype/content');
  await ready(page);
  await page.route('**/images/profile/jd.jpg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/></svg>',
    }),
  );
  await page.getByLabel('Include a layout exercise').check();
  await expect(page.locator(main)).toHaveAttribute(
    'data-error',
    /dimensions do not match/u,
  );
  await expect(page.getByRole('alert')).toContainText('complete writing');
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
});

test('a real image too tall for a leaf triggers readable recovery rather than clipping', async ({
  page,
}) => {
  await page.goto('/prototype/content');
  await ready(page);
  await page.addStyleTag({ content: '.leaf-body img { min-height: 1000px; }' });
  await page.getByLabel('Include a layout exercise').check();
  await expect(page.locator(main)).toHaveAttribute(
    'data-error',
    /cannot fit/u,
    { timeout: 25000 },
  );
  await expect(page.getByRole('alert')).toContainText('complete writing');
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
  await page.locator('.canonical-original summary').click();
  await expect(page.locator('.canonical-original article')).toContainText(
    'Some questions take time.',
  );
});

test('replacing a layout cancels a pending image wait', async ({ page }) => {
  await page.goto('/prototype/content');
  await ready(page);
  let blocked = false;
  await page.route('**/images/profile/jd.jpg', () => {
    blocked = true;
  });
  await page.getByLabel('Include a layout exercise').check();
  await expect.poll(() => blocked).toBe(true);
  await page.getByLabel('Include a layout exercise').uncheck();
  await page.getByLabel('Choose a work').selectOption('odyssey');
  await ready(page);
  await conservation(page);
  await expect(page.locator('.canonical-leaf .leaf-header').first()).toHaveText(
    'The Odyssey',
  );
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
});
