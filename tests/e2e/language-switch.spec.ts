import { test, expect } from '@playwright/test';

const translations = {
  de: {
    title: 'Schweizer Tourismus Karte',
    tagline: 'Schweiz erkunden',
    subtitle: 'Sehenswürdigkeiten • Resorts • Produkte',
  },
  en: {
    title: 'Swiss Tourism Map',
    tagline: 'Explore Switzerland',
    subtitle: 'Sights • Resorts • Products',
  },
  fr: {
    title: 'Carte du tourisme suisse',
    tagline: 'Découvrir la Suisse',
    subtitle: 'Sites touristiques • Stations • Produits',
  },
  it: {
    title: 'Mappa del turismo svizzero',
    tagline: 'Scopri la Svizzera',
    subtitle: 'Attrazioni • Resort • Prodotti',
  },
  hi: {
    title: 'स्विस पर्यटन मानचित्र',
    tagline: 'स्विट्जरलैंड की खोज करें',
    subtitle: 'दर्शनीय स्थल • रिसॉर्ट्स • उत्पाद',
  },
  zh: {
    title: '瑞士旅游地图',
    tagline: '探索瑞士',
    subtitle: '景点 • 度假村 • 产品',
  },
};

test.describe('Multilingual Support (i18n)', () => {
  test('language selector updates header text for all locales', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header h1').first();
    const tagline = page
      .locator('header p')
      .filter({ hasText: /erkunden|Explore|Découvrir|Scopri|खोज|探索/ });
    const select = page.locator('select[aria-label="Language selection"]');

    // Test all six languages
    for (const [lang, text] of Object.entries(translations)) {
      await select.selectOption(lang);

      // Wait for header to update
      await expect(header).toContainText(text.title, { timeout: 5000 });

      // Check tagline
      await expect(tagline).toContainText(text.tagline, { timeout: 5000 });

      // Check that the correct language is selected
      await expect(select).toHaveValue(lang);
    }
  });

  test('URL query parameter sets initial language', async ({ page }) => {
    // Test French via URL parameter
    await page.goto('/?lang=fr');
    const header = page.locator('header h1').first();
    await expect(header).toContainText(translations.fr.title, { timeout: 5000 });

    const select = page.locator('select[aria-label="Language selection"]');
    await expect(select).toHaveValue('fr');
  });

  test('language preference persists after page reload', async ({ page }) => {
    await page.goto('/');

    const select = page.locator('select[aria-label="Language selection"]');
    const header = page.locator('header h1').first();

    // Switch to Italian
    await select.selectOption('it');
    await expect(header).toContainText(translations.it.title, { timeout: 5000 });

    // Reload page
    await page.reload();

    // Should still be Italian
    await expect(select).toHaveValue('it');
    await expect(header).toContainText(translations.it.title, { timeout: 5000 });
  });

  test('HTML lang attribute changes with language selection', async ({ page }) => {
    await page.goto('/');

    const select = page.locator('select[aria-label="Language selection"]');

    // Test a few languages
    for (const lang of ['en', 'zh', 'hi', 'de']) {
      await select.selectOption(lang);

      // Check HTML lang attribute
      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBe(lang);
    }
  });

  test('CJK and Devanagari fonts load correctly', async ({ page }) => {
    // Test Chinese
    await page.goto('/?lang=zh');
    const header = page.locator('header h1').first();
    await expect(header).toContainText(translations.zh.title);

    // Check computed font family includes CJK font
    const fontFamily = await header.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(fontFamily.toLowerCase()).toContain('noto sans sc');

    // Test Hindi
    await page.goto('/?lang=hi');
    await expect(header).toContainText(translations.hi.title);

    const hindiFontFamily = await header.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(hindiFontFamily.toLowerCase()).toContain('noto sans devanagari');
  });
});
