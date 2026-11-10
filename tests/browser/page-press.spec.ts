import { test, expect, type Page } from '@playwright/test';
async function ready(page: Page) {
  await expect(page.locator('.notebook-reader')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: 45000 },
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
}
async function open(page: Page) {
  test.setTimeout(90000);
  await page.goto('/analyses/odyssey');
  await ready(page);
  await page.locator('iframe').scrollIntoViewIfNeeded();
  return (await page.locator('iframe').boundingBox())!;
}
test('quick right and left page clicks turn forward and backward', async ({
  page,
}) => {
  const box = await open(page);
  const before = await page.locator('.reader-page-count').textContent();
  await page.mouse.click(box.x + box.width * 0.8, box.y + 180);
  await ready(page);
  await expect(page.locator('.reader-page-count')).not.toHaveText(before!);
  const spread =
    (await page
      .locator('.reader-book-assembly')
      .getAttribute('data-spread')) === 'true';
  await page.mouse.click(box.x + (spread ? box.width * 0.2 : 8), box.y + 180);
  await ready(page);
  await expect(page.locator('.reader-page-count')).toHaveText(before!);
});
test('stationary mouse hold picks up the bottom corner and crease stays below the sheet', async ({
  page,
}) => {
  const box = await open(page);
  const before = await page.locator('.reader-page-count').textContent();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.4);
  await page.mouse.down();
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('html')).toHaveClass(/paper-dragging/u);
  const folding = frame.locator('.page-leaf').filter({ visible: true });
  expect(
    await folding.evaluateAll((nodes) =>
      nodes.some((el) =>
        (el as HTMLElement).style.clipPath.includes('polygon'),
      ),
    ),
  ).toBe(true);
  if (
    (await page
      .locator('.reader-book-assembly')
      .getAttribute('data-spread')) === 'true'
  ) {
    expect(
      await frame.locator('.reader-crease').evaluate((el) => {
        const z = Number(getComputedStyle(el).zIndex);
        const pageZ = Array.from(
          el.parentElement!.querySelectorAll<HTMLElement>('.page-leaf'),
        )
          .filter((page) => page.style.clipPath.includes('polygon'))
          .map((page) => Number(getComputedStyle(page).zIndex));
        return pageZ.some((value) => value > z) && z > 2;
      }),
    ).toBe(true);
  }
  await page
    .locator('iframe')
    .screenshot({ path: `.cache/p5-2-press-${test.info().project.name}.png` });
  await page.mouse.move(box.x + 2, box.y + box.height * 0.4, { steps: 12 });
  await page.mouse.up();
  await ready(page);
  await expect(page.locator('.reader-page-count')).not.toHaveText(before!);
});
test('dragging body text for selection does not turn a page', async ({
  page,
}) => {
  await open(page);
  const before = await page.locator('.reader-page-count').textContent();
  const text = page
    .frameLocator('iframe')
    .locator('.page-leaf[aria-hidden="false"] .leaf-body p')
    .first();
  const box = (await text.boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + Math.min(140, box.width - 12), box.y + 10, {
    steps: 6,
  });
  await page.mouse.up();
  await expect(page.locator('.reader-page-count')).toHaveText(before!);
  await expect(page.frameLocator('iframe').locator('html')).not.toHaveClass(
    /paper-dragging/u,
  );
  expect(
    await text.evaluate(() => window.getSelection()?.toString().length ?? 0),
  ).toBeGreaterThan(0);
});
