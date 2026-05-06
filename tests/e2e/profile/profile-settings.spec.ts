import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { ProfilePage } from '../pages/ProfilePage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;

const MOCK_CONTACT_SETTINGS = {
  notification_email: true,
  notification_sms: false,
  notification_push: true,
  language: 'ro',
};

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/contacts/**/settings**`, (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_CONTACT_SETTINGS }),
      });
    } else {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_CONTACT_SETTINGS }),
      });
    }
  });

  await goToAuthenticatedPage(page, '/profile', TENANT_BASE_URL);
});

test('settings tab loads notification preferences', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await profile.switchToTab('settings');

  // Should show toggles or checkboxes for notification channels
  await expect(page.locator('.q-toggle, .q-checkbox, input[type="checkbox"]').first()).toBeVisible({ timeout: 5000 });
});

test('devices tab renders registered devices section', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await profile.switchToTab('devices');

  // Devices section should mount
  await expect(page.locator('.q-tab-panel[aria-hidden="false"]')).toBeVisible({ timeout: 3000 });
});
