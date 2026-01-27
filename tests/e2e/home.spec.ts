import { test, expect } from '@playwright/test';

test('homepage shows site title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Schweizer Tourismus Karte/);
  await expect(page.locator('h1')).toContainText('Schweizer Tourismus Karte');
});
