import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;

const MOCK_SUBSCRIPTIONS = [
  {
    id: 'sub-1',
    contract_no: 'GAS-001',
    group: 'natural-gas',
    status: 'active',
    address: { full_address: '123 Main St, Bucharest' },
  },
  {
    id: 'sub-2',
    contract_no: 'EL-001',
    group: 'electricity',
    status: 'active',
    address: { full_address: '456 Oak Ave, Cluj' },
  },
];

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/subscriptions**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_SUBSCRIPTIONS, meta: { total: 2 } }),
    });
  });
  await goToAuthenticatedPage(page, '/subscriptions', TENANT_BASE_URL);
});

test('renders subscription list', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
  await expect(page.locator('text=GAS-001')).toBeVisible();
  await expect(page.locator('text=EL-001')).toBeVisible();
});

test('shows addresses in list items', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
  await expect(page.locator('text=123 Main St')).toBeVisible();
});

test('clicking subscription navigates to detail', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });

  // Click first subscription card/item
  await page.locator('.q-card, .app-list-item, .q-item').filter({ hasText: 'GAS-001' }).first().click();
  await expect(page).toHaveURL(/\/subscriptions\/sub-1/);
});

test('shows empty state when no subscriptions', async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/subscriptions**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0 } }),
    });
  });
  await page.reload();
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });

  // Empty state or no-results message
  await expect(page.locator('.empty-state, .q-card').filter({ hasText: /no.*subscri|abonamente/i })).toBeVisible({ timeout: 5000 });
});
