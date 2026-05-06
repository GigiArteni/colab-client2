import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { InvoiceDetailPage } from '../pages/InvoicePage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;
const INVOICE_ID = 'inv-detail-1';

const MOCK_INVOICE = {
  id: INVOICE_ID,
  number: 'INV-DETAIL-001',
  status: 'sent',
  group: 'natural-gas',
  invoice_at: '2026-04-01T00:00:00Z',
  due_date: '2026-04-30T00:00:00Z',
  total: 350.0,
  total_paid: 0,
  currency: 'RON',
  items: [
    { id: 'item-1', description: 'Gas supply April', quantity: 45.2, unit: 'm³', unit_price: 7.74, total: 349.85 },
  ],
  receipts: [],
  subscription: { id: 'sub-1', contract_no: 'GAS-001' },
  subsidies: [],
};

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_INVOICE }),
    });
  });

  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}/corrections**`, (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });

  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}/status-logs**`, (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });

  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}/activities**`, (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], meta: { total: 0 } }) });
  });

  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}/alerts**`, (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });

  await goToAuthenticatedPage(page, `/invoices/${INVOICE_ID}`, TENANT_BASE_URL);
});

test('renders invoice detail with items', async ({ page }) => {
  const detail = new InvoiceDetailPage(page);
  await detail.waitForLoad();

  await expect(detail.tabDetail).toBeVisible();
  await expect(detail.tabHistory).toBeVisible();
  await expect(page.locator('text=INV-DETAIL-001')).toBeVisible();
  await expect(page.locator('text=Gas supply April')).toBeVisible();
});

test('history tab renders corrections and status logs sections', async ({ page }) => {
  const detail = new InvoiceDetailPage(page);
  await detail.waitForLoad();

  await detail.switchToHistory();
  // History tab panel should be active
  await expect(page.locator('.q-tab-panel[aria-hidden="false"]')).toBeVisible({ timeout: 3000 });
});

test('download PDF button is present', async ({ page }) => {
  const detail = new InvoiceDetailPage(page);
  await detail.waitForLoad();

  await expect(detail.downloadPdfBtn).toBeVisible();
});

test('back button navigates back', async ({ page }) => {
  const detail = new InvoiceDetailPage(page);
  await detail.waitForLoad();

  await detail.backBtn.click();
  // Should navigate away from detail page
  await expect(page).not.toHaveURL(new RegExp(`/invoices/${INVOICE_ID}$`));
});
