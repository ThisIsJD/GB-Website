import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: 45000 },
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
}
async function visible(page: Page, anchor: string) {
  await expect
    .poll(async () =>
      page
        .frameLocator('iframe')
        .locator('.page-leaf[aria-hidden="false"]')
        .evaluateAll(
          (nodes, anchor) =>
            nodes.some((node) =>
              (
                JSON.parse(node.getAttribute('data-source-ranges') ?? '[]') as {
                  anchor: string;
                }[]
              ).some((range) => range.anchor === anchor),
            ),
          anchor,
        ),
    )
    .toBe(true);
}

test('cover click opens the physical notebook and page arrows work', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open the notebook cover' }).click();
  await expect(page).toHaveURL('/notebook');
  await ready(page);
  await expect(
    page
      .getByRole('navigation', { name: 'Notebook sections' })
      .getByRole('button'),
  ).toHaveCount(6);
  const before = await page.locator('.reader-page-count').textContent();
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await ready(page);
  await expect(page.locator('.reader-page-count')).not.toHaveText(before!);
  await expect(page.locator('.reader-toolbar,.reader-tools')).toHaveCount(0);
});

test('reflow restores the current answer across size, root text size and increased writing scale', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/notebook?at=odyssey-reflection');
  await ready(page);
  await visible(page, 'odyssey-reflection');
  for (const action of [
    () => page.setViewportSize({ width: 320, height: 568 }),
    () =>
      page.evaluate(() => {
        document.documentElement.style.fontSize = '20px';
      }),
  ]) {
    const revision = await page
      .locator('.notebook-reader')
      .getAttribute('data-layout-revision');
    await action();
    await expect(page.locator('.notebook-reader')).not.toHaveAttribute(
      'data-layout-revision',
      revision!,
      { timeout: 45000 },
    );
    await ready(page);
    await visible(page, 'odyssey-reflection');
  }
  await page.goto('/analyses/odyssey?at=odyssey-reflection&view=reading');
  await expect(page.locator('.full-portfolio')).toBeVisible();
  await page.goto('/analyses/odyssey?at=odyssey-reflection');
  await ready(page);
  await visible(page, 'odyssey-reflection');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('complete reading and printing contain all canonical blocks without the engine', async ({
  page,
}) => {
  await page.goto('/notebook?view=reading');
  await expect(page.locator('.full-portfolio')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.full-portfolio [data-document-id]')).toHaveCount(
    14,
  );
  const ids = await page
    .locator('.full-portfolio [data-block-id]')
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.length).toBeGreaterThan(100);
  await page.goto('/analyses/odyssey?at=odyssey-reflection&view=reading');
  await expect(page.locator('#odyssey-reflection')).toBeFocused();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.full-portfolio')).toBeVisible();
  await expect(page.locator('.reader-toolbar')).toBeHidden();
  await expect(page.locator('.full-portfolio')).toContainText(
    'There is more to learn, and I want to keep going.',
  );
});

test('font and engine failures show the complete original writing', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.route('**/*.woff*', (route) => route.abort());
  await page.goto('/notebook');
  await expect(page.getByRole('alert')).toContainText('complete writing', {
    timeout: 45000,
  });
  await expect(page.locator('.full-portfolio')).toContainText(
    'Some questions take time.',
  );
  await expect(page.locator('.canonical-measurement')).toHaveCount(0);
  await page.unroute('**/*.woff*');
  await page.route('**/turning-pages.html', (route) => route.abort());
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('complete writing', {
    timeout: 45000,
  });
  await expect(page.locator('.full-portfolio')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
});
