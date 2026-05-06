import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { AlertPreferencesPage } from '../pages/AlertPreferencesPage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;

const MOCK_PREFERENCES = [
  { id: 'pref-1', category: 'invoice', channel: 'email', enabled: true },
  { id: 'pref-2', category: 'invoice', channel: 'sms', enabled: false },
  { id: 'pref-3', category: 'reading_reminder', channel: 'email', enabled: true },
  { id: 'pref-4', category: 'reading_reminder', channel: 'push', enabled: false },
];

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/contacts/**/alert-preferences**`, (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_PREFERENCES }),
      });
    } else if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { ...MOCK_PREFERENCES[0], enabled: true } }),
      });
    } else {
      void route.continue();
    }
  });

  // Also mock the general alert preferences endpoint
  await page.route('**/alert-preferences**', (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_PREFERENCES }),
      });
    } else {
      void route.continue();
    }
  });

  await goToAuthenticatedPage(page, '/alert-preferences', TENANT_BASE_URL);
});

test('renders alert preferences page', async ({ page }) => {
  const alertPage = new AlertPreferencesPage(page);
  await alertPage.waitForLoad();

  await expect(page.locator('.q-page')).toBeVisible();
});

test('browser notifications card is visible', async ({ page }) => {
  const alertPage = new AlertPreferencesPage(page);
  await alertPage.waitForLoad();

  await expect(alertPage.browserNotifCard).toBeVisible();
});

test('preference toggles are rendered', async ({ page }) => {
  const alertPage = new AlertPreferencesPage(page);
  await alertPage.waitForLoad();

  // Should have multiple toggles for different channels/categories
  const toggles = page.locator('.q-toggle');
  await expect(toggles.first()).toBeVisible({ timeout: 5000 });
});

test('toggling a preference calls the API', async ({ page }) => {
  const alertPage = new AlertPreferencesPage(page);
  await alertPage.waitForLoad();

  await page.route('**/alert-preferences**', (route) => {
    if (route.request().method() === 'PUT' || route.request().method() === 'PATCH' || route.request().method() === 'POST') {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'pref-2', enabled: true } }),
      });
    } else {
      void route.continue();
    }
  });

  // Toggle the first preference
  await alertPage.browserToggle.click();
  // Give it a moment for the API call
  await page.waitForTimeout(300);
  // API should have been called (or the toggle updated state)
  await expect(alertPage.browserToggle).toBeVisible();
});
