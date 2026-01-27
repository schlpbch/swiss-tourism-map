import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  // Page should have a title (language may vary)
  await expect(page).toHaveTitle(/.+/);

  // Header should be visible
  const header = page.locator('h1');
  await expect(header).toBeVisible();

  // Language selector should be present
  const languageSelector = page.locator('select[aria-label="Language selection"]');
  await expect(languageSelector).toBeVisible();

  // Should have 6 language options
  const options = languageSelector.locator('option');
  await expect(options).toHaveCount(6);
});
