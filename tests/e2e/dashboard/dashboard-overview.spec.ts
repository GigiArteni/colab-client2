import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { DashboardPage } from '../pages/DashboardPage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;

test.beforeEach(async ({ page }) => {
  // Mock invoice stats
  await page.route(`**/entities/${ENTITY_ID}/invoices/statistics**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          outstanding_amount: 1250.5,
          current_month: { total_collected: 800.0 },
        },
      }),
    });
  });

  // Mock invoice status counts
  await page.route(`**/entities/${ENTITY_ID}/invoices/status-counts**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { pending: 2, sent: 1, overdue: 1, paid: 5, partially_paid: 0 },
      }),
    });
  });

  // Mock subscriptions with lastUsage
  await page.route(`**/entities/${ENTITY_ID}/subscriptions**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'sub-1',
            group: 'natural-gas',
            contract_no: 'GAS-001',
            address: { full_address: '123 Main St' },
            lastUsage: { consumption: 45.2, unit: 'm³' },
          },
        ],
      }),
    });
  });

  await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);
});

test('shows stat cards with data', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.waitForLoad();
  await dashboard.expectStatCardsVisible();

  await expect(dashboard.unpaidCard).toContainText('1.250');
  await expect(dashboard.overdueCard).toContainText('1');
  await expect(dashboard.paidCard).toContainText('800');
});

test('shows subscription list items', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.waitForLoad();

  await expect(dashboard.subscriptionItems).toHaveCount(1);
  await expect(dashboard.subscriptionItems.first()).toContainText('123 Main St');
  await expect(dashboard.subscriptionItems.first()).toContainText('45.2');
});

test('view all invoices button navigates to /invoices', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.waitForLoad();

  await page.click('a[href="/invoices"], .q-btn[href="/invoices"]');
  await expect(page).toHaveURL(/\/invoices/);
});

test('subscription item click navigates to subscription detail', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.waitForLoad();

  await dashboard.subscriptionItems.first().click();
  await expect(page).toHaveURL(/\/subscriptions\/sub-1/);
});
