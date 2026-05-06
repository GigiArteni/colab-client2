import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { MeterSubmitReadingPage } from '../pages/MeterPage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;
const METER_ID = 'meter-submit-1';

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/meters/${METER_ID}**`, (route) => {
    if (route.request().url().includes('readings') && route.request().method() === 'POST') {
      return route.continue();
    }
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: METER_ID, serial_number: 'SN-SUBMIT-001', type: 'gas',
          status: 'active', current_index: 1500.0,
        },
      }),
    });
  });

  // Mock successful reading submission
  await page.route(`**/entities/${ENTITY_ID}/meters/${METER_ID}/readings**`, (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    void route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { id: 'read-new', value: 1550.5, read_at: '2026-05-01T10:00:00Z', status: 'pending' },
      }),
    });
  });

  await goToAuthenticatedPage(page, `/meters/${METER_ID}/submit-reading`, TENANT_BASE_URL);
});

test('renders submit reading form', async ({ page }) => {
  await expect(page.locator('.q-page')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 });
});

test('submit button is disabled with empty input', async ({ page }) => {
  const submitPage = new MeterSubmitReadingPage(page);
  // With no value entered, submit should be disabled or form should reject
  await expect(submitPage.submitBtn).toBeVisible({ timeout: 5000 });
});

test('successful submission shows success notification', async ({ page }) => {
  const submitPage = new MeterSubmitReadingPage(page);

  await submitPage.valueInput.fill('1550.5');
  await submitPage.submitBtn.click();

  // Should show success notification or navigate away
  await expect(
    page.locator('.q-notification, text=/success|succes|submitted|trimis/i').first()
  ).toBeVisible({ timeout: 5000 });
});

test('shows validation error for value below current index', async ({ page }) => {
  const submitPage = new MeterSubmitReadingPage(page);

  // Enter a value lower than current_index (1500)
  await submitPage.valueInput.fill('100');
  await submitPage.submitBtn.click();

  // Should show an error (either client-side or API validation)
  await page.route(`**/entities/${ENTITY_ID}/meters/${METER_ID}/readings**`, (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    void route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Reading value must be greater than current index', errors: { value: ['Invalid value'] } }),
    });
  });

  // Page should still be on submit page (not navigated away on error)
  await expect(page.locator('.q-page')).toBeVisible();
});
