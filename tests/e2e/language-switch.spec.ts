import { test, expect } from '@playwright/test';

test('language selector updates header text', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('h1');
  await expect(header).toHaveText(/Schweizer Tourismus Karte/);

  // change to English
  const select = page.locator('#language-selector select');
  await select.selectOption('en');
  await expect(header).toHaveText(/Swiss Tourism Map/);

  // change to Chinese
  await select.selectOption('zh');
  await expect(header).toHaveText(/瑞士旅游地图/);
});
