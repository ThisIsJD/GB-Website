import { expect, test } from '@playwright/test';

test('the cover renders without runtime errors or horizontal overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'My Literary Journey' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('unknown URLs recover to the cover with a keyboard-accessible link', async ({ page }) => {
  await page.goto('/unknown-page');
  await expect(page.getByText('This page is not in my notebook.')).toBeVisible();
  const recovery = page.getByRole('link', { name: 'Return to cover' });
  await recovery.focus();
  await expect(recovery).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/');
});
