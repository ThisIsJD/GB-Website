import { expect, test } from '@playwright/test';

test('the hand-drawn control opens a readable page by keyboard', async ({
  page,
}) => {
  const errors: string[] = [];
  const failedAssets: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failedAssets.push(response.url());
  });
  await page.goto('/');
  const open = page.getByRole('button', { name: 'Open the notebook cover' });
  await open.focus();
  await expect(open).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/notebook');
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: 45000 },
  );
  await expect(
    page
      .frameLocator('iframe')
      .locator('.page-leaf[aria-hidden="false"] .leaf-body')
      .first(),
  ).toContainText('Student Profile');
  await expect(page.locator('.reader-toolbar')).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(failedAssets).toEqual([]);
});

for (const width of [320, 768, 1024, 1440]) {
  test(`the sample keeps its handwriting and readable text at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/prototype');
    await page.evaluate(() => document.fonts.ready);
    const reading = page.locator('.sample-leaf');
    await expect(reading).toBeVisible();
    const styles = await reading.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        family: style.fontFamily,
        size: Number.parseFloat(style.fontSize),
        fontReady: document.fonts.check('20px "Patrick Hand"'),
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    expect(styles.family).toContain('Patrick Hand');
    expect(styles.size).toBeGreaterThanOrEqual(19);
    expect(styles.fontReady).toBe(true);
    expect(styles.overflow).toBe(false);
    await page.screenshot({
      path: `.cache/screenshots/p2.1-reading-${test.info().project.name}-${width}.png`,
      fullPage: true,
    });
    await expect(
      page.getByRole('button', { name: 'Close notebook' }),
    ).toHaveCSS('text-transform', 'none');
  });
}
