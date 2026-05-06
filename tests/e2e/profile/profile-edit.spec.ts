import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_USER } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { ProfilePage } from '../pages/ProfilePage.po';

test.use({ baseURL: TENANT_BASE_URL });

test.beforeEach(async ({ page }) => {
  // Mock profile update endpoint
  await page.route('**/profile**', (route) => {
    if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { ...MOCK_USER, name: 'Updated Name' } }),
      });
    } else {
      void route.continue();
    }
  });

  await goToAuthenticatedPage(page, '/profile', TENANT_BASE_URL);
});

test('contact tab shows editable form fields', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await profile.switchToTab('contact');

  // Contact settings section should have inputs
  await expect(page.locator('input, .q-input').first()).toBeVisible({ timeout: 5000 });
});

test('settings tab is default and visible', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  // Settings tab panel should be active by default
  await expect(page.locator('.q-tab-panel').first()).toBeVisible();
});

test('change password item is clickable', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await expect(profile.changePasswordItem).toBeVisible();
  // Just verify it's clickable (no navigation expected in Phase 5)
  await profile.changePasswordItem.click();
  // Either shows a dialog/sheet or a notification
  await expect(
    page.locator('.q-dialog, .q-notification, .q-bottom-sheet').first()
  ).toBeVisible({ timeout: 3000 });
});
