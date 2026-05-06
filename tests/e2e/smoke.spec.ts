import { test, expect } from '@playwright/test';

test('app serves a page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeAttached();
});
