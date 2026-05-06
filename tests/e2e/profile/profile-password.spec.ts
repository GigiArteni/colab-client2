import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { ProfilePage } from '../pages/ProfilePage.po';

test.use({ baseURL: TENANT_BASE_URL });

test.beforeEach(async ({ page }) => {
  await goToAuthenticatedPage(page, '/profile', TENANT_BASE_URL);
});

test('change password item is visible', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await expect(profile.changePasswordItem).toBeVisible();
});

test('tapping change password shows feedback (not-yet-implemented notification or dialog)', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await profile.changePasswordItem.click();

  // The current implementation shows a q-notify "not implemented" or opens a dialog
  await expect(
    page.locator('.q-notification, .q-dialog').first()
  ).toBeVisible({ timeout: 3000 });
});
