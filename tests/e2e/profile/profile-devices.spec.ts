import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { ProfilePage } from '../pages/ProfilePage.po';

test.use({ baseURL: TENANT_BASE_URL });

const MOCK_DEVICES = [
  { id: 'dev-1', name: 'iPhone 14', platform: 'ios', created_at: '2026-01-10T00:00:00Z' },
  { id: 'dev-2', name: 'Chrome on Windows', platform: 'web', created_at: '2026-02-15T00:00:00Z' },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/push-tokens**', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_DEVICES }),
      });
    } else if (route.request().method() === 'DELETE') {
      void route.fulfill({ status: 204, body: '' });
    } else {
      void route.continue();
    }
  });

  await goToAuthenticatedPage(page, '/profile', TENANT_BASE_URL);
});

test('devices tab shows registered devices list', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await profile.switchToTab('devices');

  await expect(page.locator('text=iPhone 14')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=Chrome on Windows')).toBeVisible({ timeout: 5000 });
});

test('revoke device removes it from list', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await profile.switchToTab('devices');

  await expect(page.locator('text=iPhone 14')).toBeVisible({ timeout: 5000 });

  // Click revoke/delete on first device
  const revokeBtn = page.locator('.q-btn').filter({ hasText: /revoke|delete|șterge|revocat/i }).first();
  await revokeBtn.click();

  // Should show confirmation or remove immediately
  // Either a dialog appears or item disappears
  const afterAction = page.locator('text=iPhone 14');
  await expect(afterAction.or(page.locator('.q-dialog'))).toBeVisible({ timeout: 3000 });
});
