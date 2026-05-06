import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { InvoiceListPage } from '../pages/InvoicePage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;

const MOCK_INVOICES = [
  {
    id: 'inv-1',
    number: 'INV-001',
    status: 'sent',
    group: 'natural-gas',
    invoice_at: '2026-04-01T00:00:00Z',
    total: 250.0,
    currency: 'RON',
    items: [],
    receipts: [],
  },
  {
    id: 'inv-2',
    number: 'INV-002',
    status: 'paid',
    group: 'electricity',
    invoice_at: '2026-03-01T00:00:00Z',
    total: 180.0,
    currency: 'RON',
    items: [],
    receipts: [],
  },
  {
    id: 'inv-3',
    number: 'INV-003',
    status: 'overdue',
    group: 'water',
    invoice_at: '2026-02-01T00:00:00Z',
    total: 95.5,
    currency: 'RON',
    items: [],
    receipts: [],
  },
];

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/invoices**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_INVOICES, meta: { total: 3, current_page: 1, last_page: 1, per_page: 15 } }),
    });
  });
  await goToAuthenticatedPage(page, '/invoices', TENANT_BASE_URL);
});

test('renders invoice list', async ({ page }) => {
  const listPage = new InvoiceListPage(page);
  await listPage.waitForLoad();

  await expect(listPage.unpaidSection).toBeVisible();
  await expect(listPage.paidSection).toBeVisible();
});

test('status toggle filter shows only sent invoices', async ({ page }) => {
  const listPage = new InvoiceListPage(page);
  await listPage.waitForLoad();

  // Click the "sent" toggle option
  await page.locator('.q-btn-toggle .q-btn').filter({ hasText: /sent|trimis/i }).click();
  await expect(listPage.paidSection).toBeHidden();
});

test('shows empty state when API returns no invoices', async ({ page }) => {
  // Override with empty response
  await page.route(`**/entities/${ENTITY_ID}/invoices**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 15 } }),
    });
  });
  await page.reload();
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });

  await expect(page.locator('.q-card').filter({ hasText: /no.*invoic|facturi/i })).toBeVisible();
});

test('clicking invoice card navigates to detail', async ({ page }) => {
  const listPage = new InvoiceListPage(page);
  await listPage.waitForLoad();

  // Click first invoice card (InvoiceCard component emits @click)
  await page.locator('.q-card').filter({ hasText: 'INV-001' }).first().click();
  await expect(page).toHaveURL(/\/invoices\/inv-1/);
});
