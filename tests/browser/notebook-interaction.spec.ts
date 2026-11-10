import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: 45000 },
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
}
async function open(page: Page, reduced = false) {
  test.setTimeout(120000);
  await page.emulateMedia({
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  await page.goto('/analyses/odyssey');
  await ready(page);
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-jumping',
    'false',
  );
}

test('colored side bookmarks slide and the spread has a crease and corner arrows', async ({
  page,
}) => {
  await open(page);
  const tabs = page.getByRole('navigation', { name: 'Notebook sections' });
  await expect(tabs.getByRole('button')).toHaveCount(5);
  const tab = tabs.getByRole('button', {
    name: 'Favorite Masterpiece',
    exact: true,
  });
  const paper = await page.locator('.reader-shell').boundingBox();
  const box = await tab.boundingBox();
  expect(box!.x).toBeGreaterThan(paper!.x + paper!.width - 16);
  const before = await tab.evaluate((el) => getComputedStyle(el).transform);
  await tab.focus();
  if ((await tabs.getAttribute('data-compact')) === 'false')
    await expect
      .poll(() => tab.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(before);
  const spread = await page
    .locator('.reader-book-assembly')
    .getAttribute('data-spread');
  if (spread === 'true')
    await expect(
      page.frameLocator('iframe').locator('.reader-crease'),
    ).toBeVisible();
  const arrow = page.getByRole('button', { name: 'Next page', exact: true });
  expect((await arrow.textContent())!.trim()).toBe('');
  const arrowBox = await arrow.boundingBox();
  expect(arrowBox!.y).toBeGreaterThan(paper!.y + paper!.height - 60);
  expect(arrowBox!.x).toBeGreaterThan(paper!.x + paper!.width - 60);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('rapid reverse section requests land on the newest target with one announcement', async ({
  page,
}) => {
  await open(page);
  await page.evaluate(() => {
    const root = document.querySelector('.reader-announcement')!;
    (window as unknown as { announcements: string[] }).announcements = [];
    new MutationObserver(() => {
      (window as unknown as { announcements: string[] }).announcements.push(
        root.textContent!,
      );
    }).observe(root, { childList: true, subtree: true, characterData: true });
  });
  await page
    .getByRole('button', { name: 'Personal Reflection', exact: true })
    .click();
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-jumping',
    'true',
  );
  await page.evaluate(() => {
    for (const id of [
      'student-profile',
      'summary-of-learning',
      'favorite-masterpiece',
    ])
      (
        document.querySelector(`[data-section="${id}"]`) as HTMLButtonElement
      ).click();
  });
  await expect(page).toHaveURL('/favorite');
  await ready(page);
  await expect(
    page.locator('[data-section="favorite-masterpiece"]'),
  ).toHaveAttribute('aria-current', 'page');
  expect(
    Number(
      await page.locator('.notebook-reader').getAttribute('data-burst-turns'),
    ),
  ).toBeLessThanOrEqual(3);
  expect(
    Number(
      await page
        .locator('.notebook-reader')
        .getAttribute('data-burst-duration'),
    ),
  ).toBeLessThanOrEqual(1400);
  await expect(page.locator('.reader-announcement')).toContainText(
    'Favorite Masterpiece',
  );
  expect(
    await page.evaluate(
      () => (window as unknown as { announcements: string[] }).announcements,
    ),
  ).toHaveLength(1);
  const before = await page.locator('.reader-page-count').textContent();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await ready(page);
  await expect(page.locator('.reader-page-count')).not.toHaveText(before!);
});

test('paper follows a held corner drag and turns after release', async ({
  page,
}) => {
  await open(page);
  const before = await page.locator('.reader-page-count').textContent();
  const frame = page.frameLocator('iframe');
  await page.locator('iframe').scrollIntoViewIfNeeded();
  const box = (await page.locator('iframe').boundingBox())!;
  await page.mouse.move(box.x + box.width - 12, box.y + box.height - 18);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.65, {
    steps: 12,
  });
  await expect(frame.locator('html')).toHaveClass(/paper-dragging/u);
  if (
    (await page
      .locator('.reader-book-assembly')
      .getAttribute('data-spread')) === 'true'
  ) {
    await expect(
      page.frameLocator('iframe').locator('.reader-crease'),
    ).toHaveCSS('opacity', '1');
    await expect(
      page.frameLocator('iframe').locator('.reader-crease'),
    ).toBeVisible();
  }
  const fold = await frame
    .locator('.stf__item')
    .evaluateAll((nodes) =>
      nodes.some((el) =>
        (el as HTMLElement).style.clipPath.includes('polygon'),
      ),
    );
  expect(fold).toBe(true);
  await page.locator('iframe').screenshot({
    path: `.cache/p5-2-held-drag-${test.info().project.name}.png`,
  });
  await page.mouse.move(box.x + 8, box.y + box.height * 0.45, { steps: 12 });
  await page.mouse.up();
  await ready(page);
  await expect(frame.locator('html')).not.toHaveClass(/paper-dragging/u);
  await expect(page.locator('.reader-page-count')).not.toHaveText(before!);
});

test('touch dragging a paper edge turns without requiring a mouse', async ({
  page,
}) => {
  await open(page);
  await page.locator('iframe').scrollIntoViewIfNeeded();
  const box = (await page.locator('iframe').boundingBox())!;
  const before = await page.locator('.reader-page-count').textContent();
  const session = await page.context().newCDPSession(page);
  const from = { x: box.x + box.width - 16, y: box.y + box.height - 28 };
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [from],
  });
  for (let i = 1; i <= 16; i++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: from.x - ((box.width - 32) * i) / 16, y: from.y - (80 * i) / 16 },
      ],
    });
  }
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await ready(page);
  await expect(page.locator('.reader-page-count')).not.toHaveText(before!);
  await session.detach();
});

test('smaller writing uses tighter rules, outer corner numbers and a centered crease', async ({
  page,
}) => {
  await open(page, true);
  const spread =
    (await page
      .locator('.reader-book-assembly')
      .getAttribute('data-spread')) === 'true';
  if (spread) {
    const crease = (await page
      .frameLocator('iframe')
      .locator('.reader-crease')
      .boundingBox())!;
    const center = await page.evaluate(
      () => document.documentElement.clientWidth / 2,
    );
    expect(Math.abs(crease.x + crease.width / 2 - center)).toBeLessThanOrEqual(
      2,
    );
  }
  const leaves = page
    .frameLocator('iframe')
    .locator('.page-leaf[aria-hidden="false"]');
  const styles = await leaves.evaluateAll((nodes) =>
    nodes.map((el) => {
      const footer = el.querySelector('.leaf-footer')!;
      const box = el.getBoundingClientRect();
      const number = footer.getBoundingClientRect();
      return {
        font: parseFloat(getComputedStyle(el).fontSize),
        line: parseFloat(getComputedStyle(el).lineHeight),
        number: footer.textContent!.trim(),
        numberFont: parseFloat(getComputedStyle(footer).fontSize),
        align: getComputedStyle(footer).textAlign,
        left: el.classList.contains('--left'),
        bottom: box.bottom - number.bottom,
      };
    }),
  );
  for (const style of styles) {
    expect(style.font).toBeLessThanOrEqual(17);
    expect(style.line).toBeLessThanOrEqual(26);
    expect(style.number).toMatch(/^\d+$/u);
    expect(style.numberFont).toBe(12);
    expect(style.align).toBe(style.left ? 'left' : 'right');
    expect(style.bottom).toBeLessThanOrEqual(16);
  }
});

test('a jump survives reflow and reduced motion uses no burst turns', async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole('button', { name: 'Personal Reflection', exact: true })
    .click();
  await page.setViewportSize({ width: 320, height: 800 });
  await ready(page);
  await expect(page).toHaveURL('/reflection');
  await expect(
    page.locator('[data-section="personal-reflection"]'),
  ).toHaveAttribute('aria-current', 'page');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page
    .getByRole('button', { name: 'Student Profile', exact: true })
    .click();
  await ready(page);
  await expect(page).toHaveURL('/profile');
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-burst-turns',
    '0',
  );
  await expect(
    page.locator('[data-section="student-profile"]'),
  ).toHaveAttribute('aria-current', 'page');
});
