import { expect, test } from '@playwright/test';

test.only('is focused', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Home');
});
