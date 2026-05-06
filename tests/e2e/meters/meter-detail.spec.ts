import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { MeterDetailPage } from '../pages/MeterPage.po';

test.use({ baseURL: TENANT_BASE_URL });

const ENTITY_ID = MOCK_ENTITIES[0]!.id;
const METER_ID = 'meter-detail-1';

const MOCK_METER = {
  id: METER_ID,
  serial_number: 'SN-DETAIL-001',
  type: 'gas',
  status: 'active',
  current_index: 2048.75,
  last_reading_date: '2026-04-25T00:00:00Z',
  installed_date: '2019-03-10T00:00:00Z',
  subscription: { id: 'sub-1', contract_no: 'GAS-001' },
};

const MOCK_READINGS = [
  { id: 'read-1', value: 2048.75, read_at: '2026-04-25T10:00:00Z', status: 'approved' },
  { id: 'read-2', value: 2003.50, read_at: '2026-03-25T10:00:00Z', status: 'approved' },
];

test.beforeEach(async ({ page }) => {
  await page.route(`**/entities/${ENTITY_ID}/meters/${METER_ID}**`, (route) => {
    const url = route.request().url();
    if (url.includes('readings')) {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_READINGS, meta: { total: 2 } }),
      });
    } else {
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_METER }),
      });
    }
  });

  await goToAuthenticatedPage(page, `/meters/${METER_ID}`, TENANT_BASE_URL);
});

test('renders meter serial number', async ({ page }) => {
  const detail = new MeterDetailPage(page);
  await detail.waitForLoad();

  await expect(page.locator('text=SN-DETAIL-001')).toBeVisible();
});

test('shows current index value', async ({ page }) => {
  const detail = new MeterDetailPage(page);
  await detail.waitForLoad();

  await expect(page.locator('text=2.048')).toBeVisible();
});

test('shows readings history section', async ({ page }) => {
  const detail = new MeterDetailPage(page);
  await detail.waitForLoad();

  // Readings should appear
  await expect(page.locator('text=2.048')).toBeVisible();
  await expect(page.locator('text=2.003')).toBeVisible();
});

test('submit reading button navigates to submit page', async ({ page }) => {
  const detail = new MeterDetailPage(page);
  await detail.waitForLoad();

  await detail.submitReadingBtn.click();
  await expect(page).toHaveURL(new RegExp(`/meters/${METER_ID}/submit-reading`));
});
