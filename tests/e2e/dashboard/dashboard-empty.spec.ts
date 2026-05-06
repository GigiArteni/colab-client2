import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { DashboardPage } from '../pages/DashboardPage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/invoices/statistics**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { outstanding_amount: 0, current_month: { total_collected: 0 } } }),
    });
  });

  await page.route(`**/entities/${ENTITY_ID}/invoices/status-counts**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { pending: 0, sent: 0, overdue: 0, paid: 0, partially_paid: 0 } }),
    });
  });

  await page.route(`**/entities/${ENTITY_ID}/subscriptions**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);
});

test('shows empty state when no subscriptions', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.waitForLoad();

  await expect(dashboard.emptyState).toBeVisible();
  await expect(dashboard.subscriptionItems).toHaveCount(0);
});

test('stat cards show zero values', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.waitForLoad();

  await expect(dashboard.unpaidCard).toContainText('0');
  await expect(dashboard.overdueCard).toContainText('0');
});
