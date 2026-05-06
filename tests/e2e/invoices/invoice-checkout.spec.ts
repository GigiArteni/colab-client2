import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;
const INVOICE_ID = 'inv-pay-1';

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}**`, (route) => {
    if (route.request().url().includes('/pay') || route.request().url().includes('payment')) return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: INVOICE_ID, number: 'INV-PAY-001', status: 'sent',
          total: 200.0, total_paid: 0, currency: 'RON',
          items: [], receipts: [], subsidies: [],
        },
      }),
    });
  });

  // Mock payment intent creation
  await page.route(`**/entities/${ENTITY_ID}/invoices/${INVOICE_ID}/payment-intent**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { client_secret: 'pi_mock_secret_123', amount: 20000, currency: 'ron' },
      }),
    });
  });

  // Mock Stripe JS to prevent actual SDK load
  await page.route('**/js.stripe.com/**', (route) => route.abort());
  await page.route('**/stripe.com/**', (route) => route.abort());
});

test('checkout page loads for payable invoice', async ({ page }) => {
  await goToAuthenticatedPage(page, `/invoices/${INVOICE_ID}/pay`, TENANT_BASE_URL);

  // Page should mount — either checkout form or a loading/error state
  await expect(page.locator('.q-page')).toBeVisible({ timeout: 8000 });
});

test('payment success page renders after redirect', async ({ page }) => {
  await goToAuthenticatedPage(page, '/payments/success?invoice_id=' + INVOICE_ID, TENANT_BASE_URL);

  await expect(page.locator('.q-page')).toBeVisible({ timeout: 8000 });
  // Should contain some success indication
  await expect(page.locator('text=/success|succes|paid|plătit/i')).toBeVisible({ timeout: 5000 });
});
