import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page) {
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-ready',
    'true',
  );
}
async function choose(page: Page, index: number) {
  if ((await page.locator('.reading-options').getAttribute('open')) === null) {
    await page.getByText('Reading samples', { exact: true }).click();
  }
  await page.getByLabel('Choose a reading page').selectOption(String(index));
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-engine-state',
    'read',
  );
  await expect
    .poll(async () =>
      (await page.locator('.book-window').getAttribute('data-visible'))?.split(
        ',',
      ),
    )
    .toContain(String(index));
}

test('hard cover, soft curl, shadows, and responsive modes use the real engine', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/prototype/book');
  await ready(page);
  const surface = page.locator('.book-window');
  const book = page.frameLocator('iframe[title="Notebook pages"]');
  const spread = (page.viewportSize()?.width ?? 0) - 48 >= 680;
  await expect(surface).toHaveAttribute(
    'data-mode',
    spread ? 'landscape' : 'portrait',
  );
  await expect(book.locator('[data-density="hard"]')).toHaveCount(2);
  await expect(book.locator('.page-leaf').first()).toHaveCSS(
    'font-family',
    /Patrick Hand/,
  );
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(surface).toHaveAttribute('data-engine-state', 'flipping');
  await expect(surface).toHaveAttribute('data-engine-state', 'read');
  await expect(surface).toHaveAttribute('data-page-index', '1');
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(surface).toHaveAttribute('data-engine-state', 'flipping');
  await expect
    .poll(() =>
      book
        .locator('.stf__outerShadow')
        .evaluateAll((elements) =>
          elements.some(
            (element) => getComputedStyle(element).display !== 'none',
          ),
        ),
    )
    .toBe(true);
  await page.screenshot({
    path: `.cache/screenshots/p2.2-curl-${test.info().project.name}.png`,
    fullPage: true,
  });
  await expect(surface).toHaveAttribute('data-engine-state', 'read');
  await expect(surface).toHaveAttribute('data-page-index', spread ? '3' : '2');
  expect(errors).toEqual([]);
});

test('same-count and different-count content replacements dispose the old document', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  await choose(page, 1);
  const before = page
    .frames()
    .find((frame) => frame.url().includes('turning-pages.html'))!;
  const revision = await page
    .locator('.book-window')
    .getAttribute('data-revision');
  await page.getByRole('button', { name: 'Refresh reading sample' }).click();
  await expect(page.locator('.book-window')).not.toHaveAttribute(
    'data-revision',
    revision!,
  );
  await ready(page);
  expect(before.isDetached()).toBe(true);
  const book = page.frameLocator('iframe[title="Notebook pages"]');
  await expect(book.locator('[data-leaf-id="sample-1"]')).toContainText(
    'Keep moving, but remember why you started.',
  );
  expect(
    await book
      .locator('.page-leaf')
      .evaluateAll(
        (elements) =>
          new Set(
            elements.map((element) => element.getAttribute('data-leaf-id')),
          ).size,
      ),
  ).toBe(10);
  await page.getByRole('button', { name: 'Use fewer notes' }).click();
  await ready(page);
  expect(
    await book
      .locator('.page-leaf')
      .evaluateAll(
        (elements) =>
          new Set(
            elements.map((element) => element.getAttribute('data-leaf-id')),
          ).size,
      ),
  ).toBe(8);
  await expect(page.locator('iframe')).toHaveCount(1);
});

test('repeated removal stops child callbacks and leaves no stale engine document', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Reflect.set(globalThis, 'childFrameTicks', 0);
    globalThis.addEventListener('message', (event: MessageEvent) => {
      if (event.data?.probe === 'frame-tick') {
        Reflect.set(
          globalThis,
          'childFrameTicks',
          Number(Reflect.get(globalThis, 'childFrameTicks')) + 1,
        );
      }
    });
    const original = globalThis.requestAnimationFrame.bind(globalThis);
    globalThis.requestAnimationFrame = (callback) =>
      original((time) => {
        if (window.frameElement)
          parent.postMessage({ probe: 'frame-tick' }, location.origin);
        callback(time);
      });
  });
  await page.goto('/prototype/book');
  for (let cycle = 0; cycle < 3; cycle++) {
    await ready(page);
    const frame = page
      .frames()
      .find((value) => value.url().includes('turning-pages.html'))!;
    await expect
      .poll(() =>
        page.evaluate(() => Number(Reflect.get(globalThis, 'childFrameTicks'))),
      )
      .toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Read without page turns' }).click();
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(frame.isDetached()).toBe(true);
    await page.waitForTimeout(100);
    const before = await page.evaluate(() =>
      Reflect.get(globalThis, 'childFrameTicks'),
    );
    await page.waitForTimeout(200);
    expect(
      await page.evaluate(() => Reflect.get(globalThis, 'childFrameTicks')),
    ).toBe(before);
    expect(page.frames()).toHaveLength(1);
    if (cycle < 2)
      await page.getByRole('button', { name: 'Back to notebook' }).click();
  }
});

test('text selection and an embedded link do not accidentally turn pages', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  await choose(page, 1);
  const book = page.frameLocator('iframe[title="Notebook pages"]');
  const paragraph = book.locator('[data-leaf-id="sample-1"] p').first();
  const bounds = await paragraph.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + 4, bounds!.y + 8);
  await page.mouse.down();
  await page.mouse.move(
    bounds!.x + Math.min(bounds!.width - 8, 180),
    bounds!.y + 8,
    { steps: 8 },
  );
  await page.mouse.up();
  const frame = page
    .frames()
    .find((value) => value.url().includes('turning-pages.html'))!;
  expect(
    await frame.evaluate(() => getSelection()?.toString().length ?? 0),
  ).toBeGreaterThan(0);
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-page-index',
    '1',
  );
  await choose(page, 6);
  await book.getByRole('link', { name: 'Back to the reading page' }).click();
  await expect(page).toHaveURL('/prototype');
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('safe edge swipes turn while vertical touch gestures preserve document scrolling', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  const box = await page.locator('iframe').boundingBox();
  expect(box).not.toBeNull();
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  const x = box!.x + box!.width - 12;
  const y = box!.y + 160;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: x - 120, y: y + 2 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-page-index',
    '1',
  );
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-engine-state',
    'read',
  );
  const index = await page
    .locator('.book-window')
    .getAttribute('data-page-index');
  const mid = box!.x + box!.width / 2;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: mid, y: y + 120 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: mid + 1, y: y - 60 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-page-index',
    index!,
  );
  await session.detach();
});

test('inactive leaves and engine copies stay outside the focus and reading order', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  const book = page.frameLocator('iframe[title="Notebook pages"]');
  await expect(book.getByRole('link')).toHaveCount(0);
  expect(
    await book
      .locator('.page-leaf[aria-hidden="true"]')
      .evaluateAll((elements) =>
        elements.every((element) => (element as HTMLElement).inert),
      ),
  ).toBe(true);
  expect(
    await book
      .locator('.page-leaf[aria-hidden="true"] a')
      .first()
      .evaluate((element) => {
        const before = document.activeElement;
        (element as HTMLAnchorElement).focus();
        return document.activeElement === before;
      }),
  ).toBe(true);
  await choose(page, 6);
  await expect(book.getByRole('link')).toHaveCount(2);
  await expect(
    book.getByRole('link', { name: 'Read The Odyssey' }),
  ).toHaveAttribute('target', '_blank');
  await expect(
    book.getByRole('link', { name: 'Back to the reading page' }),
  ).toHaveAttribute('target', '_parent');
});

test('programmatic backward turns settle in portrait and spread modes', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  await choose(page, 6);
  const spread =
    (await page.locator('.book-window').getAttribute('data-mode')) ===
    'landscape';
  await page
    .getByRole('button', { name: 'Previous page', exact: true })
    .click();
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-page-index',
    spread ? '3' : '5',
  );
  await choose(page, 1);
  await page
    .getByRole('button', { name: 'Previous page', exact: true })
    .click();
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-page-index',
    '0',
  );
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-engine-state',
    'read',
  );
});
