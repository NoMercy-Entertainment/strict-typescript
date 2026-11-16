import { expect, test } from '@playwright/test';

test('is not focused', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Home');
});
