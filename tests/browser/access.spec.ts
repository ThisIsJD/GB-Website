import { test, expect, type Page } from '@playwright/test';
async function ready(page: Page) {
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: 45000 },
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
}
test.beforeEach(async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
test('clean reader opens the profile first and section controls use the shared controller', async ({
  page,
}) => {
  await page.goto('/notebook');
  await ready(page);
  await expect(
    page.getByRole('button', { name: 'Contents', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('.reader-toolbar,.reader-tools')).toHaveCount(0);
  await expect(
    page
      .frameLocator('iframe')
      .getByRole('heading', { name: 'Student Profile', exact: true }),
  ).toBeVisible();
  await expect(
    page.frameLocator('iframe').locator('.polaroid').first(),
  ).toBeVisible();
  const tab = page.getByRole('button', {
    name: 'Literary Analyses',
    exact: true,
  });
  await tab.click();
  await page
    .locator('#analysis-work-flyout')
    .getByRole('button', { name: 'The Odyssey', exact: true })
    .click();
  await ready(page);
  await expect(page).toHaveURL('/analyses/odyssey');
  await expect(
    page
      .frameLocator('iframe')
      .getByRole('heading', { name: '1. Literary lens and why', exact: true }),
  ).toBeFocused();
});
test('analysis dropdown supports click, Escape and phone taps', async ({
  page,
}) => {
  await page.goto('/analyses/odyssey');
  await ready(page);
  const tab = page.getByRole('button', {
    name: 'Literary Analyses',
    exact: true,
  });
  await tab.click();
  await expect(page.locator('#analysis-work-flyout')).toBeVisible();
  await expect(page.locator('#analysis-work-flyout button')).toHaveCount(8);
  await page.keyboard.press('Escape');
  await expect(page.locator('#analysis-work-flyout')).toBeHidden();
  if (test.info().project.name.includes('mobile')) await tab.tap();
  else await tab.click();
  await page
    .locator('#analysis-work-flyout')
    .getByRole('button', { name: 'The Tale of Genji', exact: true })
    .click();
  await ready(page);
  await expect(page).toHaveURL('/analyses/tale-of-genji');
  await expect(page.locator('#analysis-work-flyout')).toBeHidden();
});

test('normal cover slides and opens once, while short touch taps keep reading stable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open the notebook cover' }).click();
  await expect(page.locator('.cover-entry-opening')).toHaveCSS(
    'animation-name',
    'cover-slide-open',
  );
  await ready(page);
  await expect(page).toHaveURL('/notebook');
  await page.locator('iframe').scrollIntoViewIfNeeded();
  const box = (await page.locator('iframe').boundingBox())!;
  const before = await page.locator('.reader-page-count').textContent();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: box.x + box.width - 12, y: box.y + 200 }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect(page.locator('.reader-page-count')).toHaveText(before!);
  await cdp.detach();
});
test('keyboard turns preserve focus and hidden originals/clones stay inert', async ({
  page,
}) => {
  await page.goto('/analyses/odyssey');
  await ready(page);
  const frame = page.frameLocator('iframe');
  const heading = frame.getByRole('heading', {
    name: '1. Literary lens and why',
    exact: true,
  });
  await expect(heading).toBeFocused();
  const before = await page.locator('.reader-page-count').textContent();
  await page.keyboard.press('ArrowRight');
  await ready(page);
  await expect(page.locator('.reader-page-count')).not.toHaveText(before!);
  const state = await frame.locator('.page-leaf').evaluateAll((nodes) =>
    nodes.map((el) => ({
      hidden: el.getAttribute('aria-hidden'),
      inert: (el as HTMLElement).inert,
    })),
  );
  expect(
    state.filter((el) => el.hidden === 'false').length,
  ).toBeLessThanOrEqual(2);
  expect(
    state.filter((el) => el.hidden === 'true').every((el) => el.inert),
  ).toBe(true);
  expect(
    await frame.locator('body').evaluate(() => document.activeElement?.tagName),
  ).not.toBe('H2');
});
test('cover is the only opening control and respects motion preference', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Open my notebook', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Open the notebook cover' }).focus();
  await page.keyboard.press('Enter');
  await ready(page);
  await expect(page).toHaveURL('/notebook');
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-burst-turns',
    '0',
  );
});
test('complete reading and print retain source writing without the contents page', async ({
  page,
}) => {
  await page.goto('/profile?view=reading');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.full-portfolio [data-document-id]')).toHaveCount(
    13,
  );
  const ids = await page
    .locator('.full-portfolio [data-block-id]')
    .evaluateAll((nodes) => nodes.map((el) => el.id));
  expect(new Set(ids).size).toBe(ids.length);
  await expect(page.locator('.full-portfolio')).toContainText(
    'There is more to learn, and I want to keep going.',
  );
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.full-portfolio')).toBeVisible();
});
