import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { MeterListPage } from '../pages/MeterPage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;

const MOCK_METERS = [
  {
    id: 'meter-1',
    serial_number: 'SN-001-GAS',
    type: 'gas',
    status: 'active',
    current_index: 1234.56,
    last_reading_date: '2026-04-20T00:00:00Z',
    installed_date: '2020-01-15T00:00:00Z',
  },
  {
    id: 'meter-2',
    serial_number: 'SN-002-GAS',
    type: 'gas',
    status: 'detached',
    current_index: 567.89,
    last_reading_date: '2026-03-10T00:00:00Z',
    installed_date: '2018-06-01T00:00:00Z',
  },
];

const MOCK_STATUS_COUNTS = { active: 1, total: 2, pending: 0, detached: 1, replaced: 0, decommissioned: 0 };

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/meters**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    const url = route.request().url();
    if (url.includes('status-counts')) {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_STATUS_COUNTS }),
      });
    } else {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_METERS, meta: { total: 2 } }),
      });
    }
  });
  await goToAuthenticatedPage(page, '/meters', TENANT_BASE_URL);
});

test('renders meter cards', async ({ page }) => {
  const listPage = new MeterListPage(page);
  await listPage.waitForLoad();

  await expect(listPage.meterCards).toHaveCount(2);
  await expect(page.locator('text=SN-001-GAS')).toBeVisible();
  await expect(page.locator('text=SN-002-GAS')).toBeVisible();
});

test('shows status chips with counts', async ({ page }) => {
  const listPage = new MeterListPage(page);
  await listPage.waitForLoad();

  await expect(listPage.activeChip).toBeVisible();
  await expect(listPage.activeChip).toContainText('1');
  await expect(listPage.totalChip).toContainText('2');
});

test('submit reading button visible only for active meters', async ({ page }) => {
  const listPage = new MeterListPage(page);
  await listPage.waitForLoad();

  // Only active meters get the submit button
  const submitBtns = page.locator('.q-btn').filter({ hasText: /submit|trimite/i });
  await expect(submitBtns).toHaveCount(1);
});

test('shows empty state when no meters', async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/meters**`, (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0 } }),
    });
  });
  await page.reload();
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });
  await expect(page.locator('.q-card').filter({ hasText: /no.*meter|contoare/i })).toBeVisible();
});
