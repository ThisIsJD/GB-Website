import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: 45000 },
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
}
async function visible(page: Page, anchor: string) {
  await expect
    .poll(() =>
      page
        .frameLocator('iframe')
        .locator('.page-leaf[aria-hidden="false"]')
        .evaluateAll(
          (nodes, target) =>
            nodes.some((node) =>
              (
                JSON.parse(node.getAttribute('data-source-ranges') ?? '[]') as {
                  anchor: string;
                }[]
              ).some((range) => range.anchor === target),
            ),
          anchor,
        ),
    )
    .toBe(true);
}
async function chooseWork(page: Page, title: string) {
  await page
    .getByRole('button', { name: 'Literary Analyses', exact: true })
    .click();
  await page
    .locator('#analysis-work-flyout')
    .getByRole('button', { name: title, exact: true })
    .click();
}
test.beforeEach(async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('pasted work and answer URLs survive refresh and changed geometry', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/analyses/odyssey?at=odyssey-reflection');
  await ready(page);
  await visible(page, 'odyssey-reflection');
  await page.reload();
  await ready(page);
  await visible(page, 'odyssey-reflection');
  await page.setViewportSize({ width: 320, height: 568 });
  await ready(page);
  await visible(page, 'odyssey-reflection');
  expect(errors).toEqual([]);
});

test('section, work and browser history share the controller', async ({
  page,
}) => {
  await page.goto('/analyses');
  await ready(page);
  await chooseWork(page, 'The Odyssey');
  await ready(page);
  await expect(page).toHaveURL('/analyses/odyssey');
  await chooseWork(page, 'The Tale of Genji');
  await ready(page);
  await expect(page).toHaveURL('/analyses/tale-of-genji');
  await chooseWork(page, 'The Odyssey');
  await ready(page);
  await expect(page).toHaveURL('/analyses/odyssey');
  await page.goBack();
  await ready(page);
  await expect(page).toHaveURL('/analyses/tale-of-genji');
  await page.goForward();
  await ready(page);
  await expect(page).toHaveURL('/analyses/odyssey');
  await page
    .getByRole('button', { name: 'Student Profile', exact: true })
    .click();
  await ready(page);
  await expect(page).toHaveURL('/profile');
  await page
    .getByRole('button', { name: 'Personal Reflection', exact: true })
    .click();
  await ready(page);
  await expect(page).toHaveURL('/reflection');
  await page.reload();
  await ready(page);
});

test('ordinary turns replace position and history restores it without loops', async ({
  page,
}) => {
  await page.goto('/analyses/odyssey');
  await ready(page);
  const length = await page.evaluate(() => history.length);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await ready(page);
  await expect(page).toHaveURL(/at=/u);
  const afterTurn = page.url();
  const counter = await page.locator('.reader-page-count').textContent();
  expect(await page.evaluate(() => history.length)).toBe(length);
  await page
    .getByRole('button', { name: 'Favorite Masterpiece', exact: true })
    .click();
  await ready(page);
  await expect(page).toHaveURL('/favorite');
  await page.goBack();
  await ready(page);
  await expect(page).toHaveURL(afterTurn);
  await expect(page.locator('.reader-page-count')).toHaveText(counter!);
  await page.reload();
  await ready(page);
  await expect(page.locator('.reader-page-count')).toHaveText(counter!);
  await page.goForward();
  await ready(page);
  await expect(page).toHaveURL('/favorite');
});

test('full reading deep links and history work without an engine', async ({
  page,
}) => {
  await page.goto('/analyses/odyssey?at=odyssey-reflection&view=reading');
  await expect(page.locator('#odyssey-reflection')).toBeFocused();
  await expect(page.locator('iframe')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Summary of Learning', exact: true })
    .click();
  await expect(page).toHaveURL('/learning?view=reading');
  await page.goBack();
  await expect(page.locator('#odyssey-reflection')).toBeFocused();
  await page.goto('/analyses/odyssey?at=odyssey-reflection');
  await ready(page);
  await visible(page, 'odyssey-reflection');
});

test('Back during a normal animated request restores the latest route', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/analyses/odyssey?at=odyssey-reflection');
  await ready(page);
  await visible(page, 'odyssey-reflection');
  await page
    .getByRole('button', { name: 'Student Profile', exact: true })
    .click();
  await expect(page).toHaveURL('/profile');
  await page.goBack();
  await ready(page);
  await expect(page).toHaveURL('/analyses/odyssey?at=odyssey-reflection');
  await visible(page, 'odyssey-reflection');
});

test('unknown slugs recover and incompatible anchors open their section', async ({
  page,
}) => {
  await page.goto('/analyses/no-such-work');
  await expect(
    page.getByRole('link', { name: 'Open reading list' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Open reading list' }).click();
  await ready(page);
  await expect(page).toHaveURL('/analyses');
  await page.goto('/profile?at=odyssey-reflection');
  await ready(page);
  await expect(
    page.getByRole('status').filter({ hasText: 'could not be found' }),
  ).toBeVisible();
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-destination',
    'student-profile-introduction',
  );
});
