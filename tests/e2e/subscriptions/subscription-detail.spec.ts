import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;
const SUB_ID = 'sub-detail-1';

const MOCK_SUBSCRIPTION = {
  id: SUB_ID,
  contract_no: 'GAS-DETAIL-001',
  group: 'natural-gas',
  status: 'active',
  address: { full_address: '789 Pine Road, Iași' },
  customer: {
    id: 'cnt-1',
    name: 'Ion Popescu',
    email: 'ion@example.com',
    phone: '+40700111222',
  },
  financial_summary: {
    total_invoiced: 1200.0,
    total_paid: 950.0,
    outstanding: 250.0,
    currency: 'RON',
  },
};

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/subscriptions/${SUB_ID}**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_SUBSCRIPTION }),
    });
  });

  // Mock usages for chart
  await page.route(`**/entities/${ENTITY_ID}/subscriptions/${SUB_ID}/usages**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await goToAuthenticatedPage(page, `/subscriptions/${SUB_ID}`, TENANT_BASE_URL);
});

test('renders subscription detail with contract number', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
  await expect(page.locator('text=GAS-DETAIL-001')).toBeVisible();
});

test('shows address', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
  await expect(page.locator('text=789 Pine Road')).toBeVisible();
});

test('shows customer info section', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
  // Customer info from Phase 5 feature
  await expect(page.locator('text=Ion Popescu')).toBeVisible({ timeout: 5000 });
});

test('shows financial summary', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
  // Outstanding amount from financial summary
  await expect(page.locator('text=/250|outstanding|restant/i').first()).toBeVisible({ timeout: 5000 });
});
