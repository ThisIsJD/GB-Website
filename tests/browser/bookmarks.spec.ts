import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page) {
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-ready',
    'true',
  );
}
const cases = [
  { kind: 'near', label: 'Student Profile', index: 1, turns: 1 },
  { kind: 'middle', label: 'Favorite Masterpiece', index: 5, turns: 2 },
  { kind: 'far', label: 'Personal Reflection', index: 8, turns: 3 },
];

for (const scenario of cases) {
  test(`${scenario.kind} bookmark jump is bounded, accurate, and focused`, async ({
    page,
  }) => {
    await page.goto('/prototype/book');
    await ready(page);
    await page
      .getByRole('button', { name: scenario.label, exact: true })
      .click();
    const main = page.locator('.book-prototype');
    await expect(main).toHaveAttribute(
      'data-jump-target',
      String(scenario.index),
    );
    await expect(main).toHaveAttribute('data-jumping', 'false');
    await expect(main).toHaveAttribute(
      'data-burst-turns',
      String(scenario.turns),
    );
    const duration = Number(await main.getAttribute('data-burst-duration'));
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThanOrEqual(1400);
    await expect(page.locator('.book-window')).toHaveAttribute(
      'data-visible',
      new RegExp(`(^|,)${scenario.index}(,|$)`),
    );
    await expect(
      page.getByRole('button', { name: scenario.label, exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    const book = page.frameLocator('iframe[title="Notebook pages"]');
    await expect(
      book.locator(`[data-leaf-id="sample-${scenario.index}"] h2`),
    ).toBeFocused();
    await mkdir('.cache/evidence', { recursive: true });
    await writeFile(
      `.cache/evidence/p2.3-${scenario.kind}-${test.info().project.name}.json`,
      JSON.stringify(
        {
          ...scenario,
          duration,
          visible: await page
            .locator('.book-window')
            .getAttribute('data-visible'),
        },
        null,
        2,
      ),
    );
  });
}

test('five bookmarks reveal with hover and focus, and stay readable without hover', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  const rail = page.getByRole('navigation', { name: 'Notebook sections' });
  await expect(rail.getByRole('button')).toHaveCount(5);
  const button = rail.getByRole('button', {
    name: 'Student Profile',
    exact: true,
  });
  const wide =
    (await page.locator('.book-assembly').getAttribute('data-wide')) === 'true';
  const book = page.frameLocator('iframe[title="Notebook pages"]');
  await button.hover();
  if (wide) await expect(book.locator('html')).toHaveClass(/bookmark-peek/);
  else await expect(book.locator('html')).not.toHaveClass(/bookmark-peek/);
  await page.screenshot({
    path: `.cache/screenshots/p2.3-hover-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole('link', { name: 'Back to the reading page', exact: true })
    .hover();
  await button.focus();
  if (wide) await expect(book.locator('html')).toHaveClass(/bookmark-peek/);
  await page.screenshot({
    path: `.cache/screenshots/p2.3-focus-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole('link', { name: 'Back to the reading page', exact: true })
    .focus();
  await expect(book.locator('html')).not.toHaveClass(/bookmark-peek/);
  if (!wide) {
    const navBounds = await rail.boundingBox();
    const frameBounds = await page.locator('iframe').boundingBox();
    expect(navBounds!.y + navBounds!.height).toBeLessThanOrEqual(
      frameBounds!.y + 1,
    );
    for (const control of await rail.getByRole('button').all()) {
      expect(
        await control.evaluate(
          (element) =>
            element.scrollWidth <= element.clientWidth &&
            element.getBoundingClientRect().height >= 44,
        ),
      ).toBe(true);
    }
  }
});

test('rapid reverse requests land only at the newest destination without a growing queue', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  const rail = page.getByRole('navigation', { name: 'Notebook sections' });
  for (const label of [
    'Personal Reflection',
    'Summary of Learning',
    'Favorite Masterpiece',
    'Student Profile',
  ]) {
    const bounds = await rail
      .getByRole('button', { name: label, exact: true })
      .boundingBox();
    await page.mouse.click(
      bounds!.x + bounds!.width * 0.75,
      bounds!.y + bounds!.height / 2,
    );
  }
  const main = page.locator('.book-prototype');
  await expect(main).toHaveAttribute('data-jump-target', '1');
  await expect(main).toHaveAttribute('data-jumping', 'false');
  expect(
    Number(await main.getAttribute('data-burst-turns')),
  ).toBeLessThanOrEqual(3);
  expect(
    Number(await main.getAttribute('data-burst-duration')),
  ).toBeLessThanOrEqual(1400);
  await expect(
    page.frameLocator('iframe').locator('[data-leaf-id="sample-1"] h2'),
  ).toBeFocused();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('a bookmark request waits for an ordinary turn to settle', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await page
    .getByRole('button', { name: 'Personal Reflection', exact: true })
    .click();
  const main = page.locator('.book-prototype');
  await expect(main).toHaveAttribute('data-jump-target', '8');
  await expect(main).toHaveAttribute('data-jumping', 'false');
  expect(
    Number(await main.getAttribute('data-burst-duration')),
  ).toBeLessThanOrEqual(1400);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('reduced motion lands immediately without a physical burst', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Reflect.set(globalThis, 'observedFlips', 0);
    window.addEventListener('message', (event) => {
      if (
        event.data?.channel === 'great-books-page-engine-v1' &&
        event.data.type === 'state' &&
        event.data.state === 'flipping'
      ) {
        Reflect.set(
          globalThis,
          'observedFlips',
          Number(Reflect.get(globalThis, 'observedFlips')) + 1,
        );
      }
    });
  });
  await page.goto('/prototype/book');
  await ready(page);
  await page
    .getByRole('button', { name: 'Personal Reflection', exact: true })
    .click();
  await expect(page.locator('.book-prototype')).toHaveAttribute(
    'data-jump-target',
    '8',
  );
  await expect(page.locator('.book-prototype')).toHaveAttribute(
    'data-burst-turns',
    '0',
  );
  expect(
    await page.evaluate(() => Reflect.get(globalThis, 'observedFlips')),
  ).toBe(0);
  await expect(
    page.frameLocator('iframe').locator('[data-leaf-id="sample-8"] h2'),
  ).toBeFocused();
});

test('the selected paper strip stays scoped during a physical turn', async ({
  page,
}) => {
  await page.goto('/prototype/book');
  await ready(page);
  await page
    .getByRole('button', { name: 'Student Profile', exact: true })
    .click();
  await expect(page.locator('.book-prototype')).toHaveAttribute(
    'data-jump-target',
    '1',
  );
  const favorite = page.getByRole('button', {
    name: 'Favorite Masterpiece',
    exact: true,
  });
  await favorite.hover();
  await favorite.click();
  await expect(page.locator('.book-window')).toHaveAttribute(
    'data-engine-state',
    'flipping',
  );
  const wide =
    (await page.locator('.book-assembly').getAttribute('data-wide')) === 'true';
  const book = page.frameLocator('iframe');
  if (wide) {
    await expect(book.locator('html')).toHaveClass(/bookmark-peek/);
    const range = await book.locator('html').evaluate((element) => ({
      top: Number.parseFloat(
        (element as HTMLElement).style.getPropertyValue('--peek-top'),
      ),
      bottom: Number.parseFloat(
        (element as HTMLElement).style.getPropertyValue('--peek-bottom'),
      ),
    }));
    const box = await favorite.boundingBox();
    expect(range.bottom - range.top).toBeCloseTo(box!.height + 12, 0);
    expect(range.bottom - range.top).toBeLessThan(120);
  }
  await page.screenshot({
    path: `.cache/screenshots/p2.3-reveal-curl-${test.info().project.name}.png`,
    fullPage: true,
  });
  await expect(page.locator('.book-prototype')).toHaveAttribute(
    'data-jump-target',
    '5',
  );
  await expect(page.locator('.book-prototype')).toHaveAttribute(
    'data-jumping',
    'false',
  );
});

test('the accepted slide fallback also reveals labels without clipping', async ({
  page,
}) => {
  await page.goto('/prototype/book?reveal=slide');
  await ready(page);
  const first = page.getByRole('button', {
    name: 'Student Profile',
    exact: true,
  });
  const wide =
    (await page.locator('.book-assembly').getAttribute('data-wide')) === 'true';
  await first.hover();
  if (wide)
    await expect(first).toHaveCSS('transform', /matrix\(1, 0, 0, 1, 20, 0\)/);
  else await expect(first).toHaveCSS('transform', 'none');
  await expect(page.frameLocator('iframe').locator('html')).not.toHaveClass(
    /bookmark-peek/,
  );
  await first.click();
  await expect(page.locator('.book-prototype')).toHaveAttribute(
    'data-jump-target',
    '1',
  );
});
