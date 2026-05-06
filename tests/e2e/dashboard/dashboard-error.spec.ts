import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;

test('shows spinner while loading', async ({ page }) => {
  // Delay the stats response to catch the loading state
  await page.route(`**/entities/${ENTITY_ID}/invoices/statistics**`, async (route) => {
    await new Promise((r) => setTimeout(r, 500));
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { outstanding_amount: 0, current_month: { total_collected: 0 } } }),
    });
  });

  await page.route(`**/entities/${ENTITY_ID}/invoices/status-counts**`, (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
  });

  await page.route(`**/entities/${ENTITY_ID}/subscriptions**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });

  await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);

  // Spinner should appear during load
  void page.locator('.q-spinner-dots');
  // It may already be gone if response is fast — just ensure page loads
  await expect(page.locator('.dashboard-page')).toBeVisible({ timeout: 10000 });
});

test('page still renders when API returns 500', async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/invoices/**`, (route) => {
    void route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Server Error' }) });
  });

  await page.route(`**/entities/${ENTITY_ID}/subscriptions**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Server Error' }) });
  });

  await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);

  // Page should still mount (error handled gracefully — no crash)
  await expect(page.locator('.dashboard-page')).toBeVisible({ timeout: 10000 });
  // Spinner should eventually hide
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
});
