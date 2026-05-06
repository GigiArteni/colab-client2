import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';

test.use({ baseURL: TENANT_BASE_URL });

test('push permission banner does not crash when Notification API unsupported', async ({ page }) => {
  // Simulate browser without Notification API
  await page.addInitScript(() => {
    // @ts-expect-error - window API override in test
    delete window.Notification;
  });

  await goToAuthenticatedPage(page, '/alert-preferences', TENANT_BASE_URL);

  // Page should still render without error
  await expect(page.locator('.q-page')).toBeVisible({ timeout: 8000 });
});

test('push permission banner shows enable button when permission is default', async ({ page }) => {
  // Simulate Notification API with default permission
  await page.addInitScript(() => {
    // @ts-expect-error - window API override in test
    window.Notification = class {
      static permission = 'default';
      static requestPermission = () => Promise.resolve('granted');
    };
  });

  await page.route('**/alert-preferences**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await goToAuthenticatedPage(page, '/alert-preferences', TENANT_BASE_URL);

  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
  // Enable button should be visible when permission is default
  await expect(page.locator('.q-btn').filter({ hasText: /enable|activează/i })).toBeVisible({ timeout: 5000 });
});
