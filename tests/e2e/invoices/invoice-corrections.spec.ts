import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { InvoiceDetailPage } from '../pages/InvoicePage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;
const INVOICE_ID = 'inv-corr-1';

const MOCK_CORRECTION = {
  id: 'corr-1',
  number: 'CREDIT-001',
  status: 'validated',
  total: -50.0,
  currency: 'RON',
  invoice_at: '2026-04-15T00:00:00Z',
  type: 'credit_note',
};

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}**`, (route) => {
    if (route.request().url().includes('corrections') || route.request().url().includes('status-logs') || route.request().url().includes('activities') || route.request().url().includes('alerts')) {
      return route.continue();
    }
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: INVOICE_ID, number: 'INV-CORR-001', status: 'sent', group: 'natural-gas',
          invoice_at: '2026-04-01T00:00:00Z', total: 350.0, total_paid: 0, currency: 'RON',
          items: [], receipts: [], subsidies: [],
        },
      }),
    });
  });

  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}/corrections**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [MOCK_CORRECTION] }),
    });
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

test('history tab shows credit note correction', async ({ page }) => {
  const detail = new InvoiceDetailPage(page);
  await detail.waitForLoad();

  await detail.switchToHistory();

  // Credit note should appear in history
  await expect(page.locator('text=CREDIT-001')).toBeVisible({ timeout: 5000 });
});

test('correction amount is displayed', async ({ page }) => {
  const detail = new InvoiceDetailPage(page);
  await detail.waitForLoad();

  await detail.switchToHistory();

  await expect(page.locator('text=-50')).toBeVisible({ timeout: 5000 });
});
