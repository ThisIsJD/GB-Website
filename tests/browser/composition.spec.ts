import { test, expect } from '@playwright/test';
test('composed openings reach all answers and actual leaves fit the P3 material shell', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto('/prototype/composition');
  await expect(page.locator('.composition-review')).toHaveAttribute(
    'data-engine-ready',
    'true',
    { timeout: 90000 },
  );
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page
    .getByLabel('Go to an opening')
    .selectOption({ label: 'The Odyssey' });
  await expect(
    page
      .frameLocator('iframe')
      .locator(
        '.page-leaf[aria-hidden="false"][data-layout-key="journey-map"]',
      ),
  ).toHaveCount(1);
  await page.getByRole('button', { name: 'Inspect all leaves' }).click();
  const checks = await page.locator('.composed-leaf').evaluateAll((elements) =>
    elements
      .filter((element) => element.getAttribute('data-kind') !== 'cover')
      .map((element) => {
        const body = element.querySelector<HTMLElement>('.leaf-body')!;
        const text = body.querySelector<HTMLElement>('.reading-content')!;
        return {
          clipped:
            body.scrollHeight > body.clientHeight ||
            text.getBoundingClientRect().bottom >
              body.getBoundingClientRect().bottom + 0.5,
          horizontal: text.scrollWidth > body.clientWidth,
        };
      }),
  );
  for (const check of checks)
    expect(check).toEqual({ clipped: false, horizontal: false });
  const maps = JSON.parse(
    (await page.locator('[data-page-maps]').getAttribute('data-page-maps'))!,
  );
  for (const id of [
    'voice-out-of-the-whirlwind',
    'panchatantra',
    'mahabharata',
    'iliad',
    'odyssey',
    'tale-of-genji',
    'les-miserables',
  ]) {
    for (const key of [
      'lens',
      'values',
      'civilization',
      'bikol',
      'contemporary',
      'reflection',
    ])
      expect(maps.answers[`${id}-${key}`].length).toBeGreaterThan(0);
  }
  const openings = JSON.parse(
    (await page
      .locator('[data-opening-records]')
      .getAttribute('data-opening-records'))!,
  );
  expect(openings).toHaveLength(13);
  expect(await page.locator('.canonical-measurement').count()).toBe(0);
  await page
    .locator('.composed-leaf[data-kind="opening"]')
    .first()
    .screenshot({ path: `resource/work/P4/P4.3/${info.project.name}.png` });
});
