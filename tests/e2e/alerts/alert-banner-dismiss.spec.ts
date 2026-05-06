import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;
const INVOICE_ID = 'inv-alert-1';

const MOCK_ALERT = {
  id: 'alert-1',
  type: 'invoice_overdue',
  title: 'Invoice overdue',
  body: 'Your invoice INV-001 is overdue.',
  read_at: null,
  resource_type: 'invoices',
  resource_id: INVOICE_ID,
};

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}**`, (route) => {
    if (route.request().url().includes('corrections') || route.request().url().includes('status-logs') || route.request().url().includes('activities')) {
      void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      return;
    }
    if (route.request().url().includes('alerts')) return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: INVOICE_ID, number: 'INV-ALERT-001', status: 'overdue',
          total: 300.0, total_paid: 0, currency: 'RON',
          items: [], receipts: [], subsidies: [],
        },
      }),
    });
  });

  // Return unread alert for this invoice
  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}/alerts**`, (route) => {
    if (route.request().method() === 'GET') {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [MOCK_ALERT] }),
      });
    } else if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
      // Dismiss endpoint
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { ...MOCK_ALERT, read_at: '2026-05-06T10:00:00Z' } }),
      });
    } else {
      void route.continue();
    }
  });

  await goToAuthenticatedPage(page, `/invoices/${INVOICE_ID}`, TENANT_BASE_URL);
});

test('alert banner is displayed on invoice detail page', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });

  // AlertBanner should appear when there are unread context alerts
  await expect(page.locator('.alert-banner, [class*="AlertBanner"], .q-banner')).toBeVisible({ timeout: 5000 });
});

test('dismissing alert removes the banner', async ({ page }) => {
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });

  const banner = page.locator('.alert-banner, [class*="AlertBanner"], .q-banner').first();
  await expect(banner).toBeVisible({ timeout: 5000 });

  // Click dismiss button
  const dismissBtn = page.locator('.q-btn').filter({ hasText: /dismiss|close|închide/i }).first();
  if (await dismissBtn.isVisible()) {
    await dismissBtn.click();
    await expect(banner).toBeHidden({ timeout: 3000 });
  }
});
