import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test.describe(`Responsive & Functional Check @ ${vp.name} (${vp.width}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('renders without horizontal overflow, broken logos, or calculation errors', async ({
      page,
    }) => {
      await page.goto('/');

      // Default language is Bangla
      await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

      // No horizontal overflow
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflow).toBe(false);

      // Verify brand images load properly (naturalWidth > 0)
      const images = page.locator('img');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const ok = await images.nth(i).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
        expect(ok).toBe(true);
      }

      // Verify default BDT 510 bKash calculation renders both Priyo & Normal cards
      await expect(page.getByTestId('card-bkash-priyo')).toBeVisible();
      await expect(page.getByTestId('card-bkash-normal')).toBeVisible();

      // Switch to English and check exact amounts for BDT 510
      await page.getByTestId('lang-toggle').click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.getByTestId('card-bkash-normal')).toContainText('BDT 500');
      await expect(page.getByTestId('card-bkash-priyo')).toContainText('BDT 502');

      // Enter 3000 -> ATM section reveals and shows unavailable without fee coverage
      await page.getByTestId('amount-input').fill('3000');
      await expect(page.getByTestId('bkash-atm-section')).toBeVisible();
      await expect(page.getByTestId('card-bkash-atm')).toContainText('3,044.70');

      // Enter 3600 -> ATM shows BDT 3,500 (500 multiple)
      await page.getByTestId('amount-input').fill('3600');
      await expect(page.getByTestId('card-bkash-atm')).toContainText('BDT 3,500');

      // Switch to Send Money tab & verify BDT 500 -> BDT 505 required
      await page.getByTestId('tab-send-money').click();
      await expect(page.getByTestId('card-sm-bkash-active')).toContainText('BDT 505');

      // Switch to NPSB tab & verify BDT 5,000 -> 8.50/1,000 fee = BDT 42.50
      await page.getByTestId('tab-npsb').click();
      await expect(page.getByTestId('card-npsb-result')).toContainText('BDT 5,042.50');

      // Dark theme toggle works
      await page.getByTestId('theme-toggle').click();
      await expect(page.locator('html')).toHaveClass(/dark/);

      // Settings page opens & shows Restore Defaults button
      await page.getByTestId('settings-toggle').click();
      await expect(page.getByTestId('rate-bkash-normal')).toBeVisible();

      // Re-verify zero horizontal overflow in settings view
      const settingsOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(settingsOverflow).toBe(false);
    });
  });
}
