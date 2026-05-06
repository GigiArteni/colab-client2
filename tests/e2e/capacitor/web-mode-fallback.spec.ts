import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';

test.use({ baseURL: TENANT_BASE_URL });

test('app loads without Capacitor plugins present', async ({ page }) => {
  // In web mode, Capacitor plugins are shimmed to no-ops.
  // Verify the app boots without JS errors caused by missing native APIs.
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);
  await expect(page.locator('.q-page')).toBeVisible({ timeout: 10000 });

  // Filter out expected non-Capacitor noise; fail only on Capacitor-related crashes
  const capacitorErrors = errors.filter((e) =>
    /capacitor|plugin|native/i.test(e)
  );
  expect(capacitorErrors).toHaveLength(0);
});

test('push notification plugin gracefully no-ops on web', async ({ page }) => {
  // Simulate Capacitor web shim — PushNotifications returns empty on web
  await page.addInitScript(() => {
    // @ts-expect-error - Capacitor not typed in window
    window.Capacitor = {
      isNativePlatform: () => false,
      getPlatform: () => 'web',
    };
  });

  await goToAuthenticatedPage(page, '/alert-preferences', TENANT_BASE_URL);

  // Page should render with no uncaught Capacitor errors
  await expect(page.locator('.q-page')).toBeVisible({ timeout: 8000 });
});

test('camera plugin absence does not break profile page', async ({ page }) => {
  await page.addInitScript(() => {
    // @ts-expect-error - Capacitor not typed in window
    window.Capacitor = {
      isNativePlatform: () => false,
      getPlatform: () => 'web',
    };
  });

  await goToAuthenticatedPage(page, '/profile', TENANT_BASE_URL);
  await expect(page.locator('.q-page')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
});
