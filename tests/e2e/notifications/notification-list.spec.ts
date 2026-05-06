import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { NotificationsPage } from '../pages/NotificationsPage.po';

test.use({ baseURL: TENANT_BASE_URL });

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'invoice_created',
    title: 'New invoice',
    body: 'Invoice INV-001 has been created.',
    read_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    data: { invoice_id: 'inv-1' },
  },
  {
    id: 'notif-2',
    type: 'payment_received',
    title: 'Payment received',
    body: 'Payment of 200 RON received.',
    read_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    data: {},
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/notifications**', (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: MOCK_NOTIFICATIONS,
        meta: { total: 2, unread_count: 1, current_page: 1, last_page: 1, per_page: 15 },
      }),
    });
  });

  await page.route('**/notifications/summary**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { unread_count: 1 } }),
    });
  });

  await goToAuthenticatedPage(page, '/notifications', TENANT_BASE_URL);
});

test('renders notification list', async ({ page }) => {
  const notifPage = new NotificationsPage(page);
  await notifPage.waitForLoad();

  await expect(notifPage.notificationCards).toHaveCount(2);
  await expect(page.locator('text=New invoice')).toBeVisible();
  await expect(page.locator('text=Payment received')).toBeVisible();
});

test('unread badge shows correct count', async ({ page }) => {
  const notifPage = new NotificationsPage(page);
  await notifPage.waitForLoad();

  await expect(notifPage.unreadBadge).toBeVisible();
  await expect(notifPage.unreadBadge).toContainText('1');
});

test('mark all read button is visible when there are unread notifications', async ({ page }) => {
  const notifPage = new NotificationsPage(page);
  await notifPage.waitForLoad();

  await expect(notifPage.markAllReadBtn).toBeVisible();
});

test('mark all read calls API and shows notification', async ({ page }) => {
  await page.route('**/notifications/read-all**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) });
  });

  const notifPage = new NotificationsPage(page);
  await notifPage.waitForLoad();

  await notifPage.markAllReadBtn.click();

  // Should show success notification
  await expect(page.locator('.q-notification')).toBeVisible({ timeout: 3000 });
});

test('filter unread-only hides read notifications', async ({ page }) => {
  const notifPage = new NotificationsPage(page);
  await notifPage.waitForLoad();

  // Mock filtered response
  await page.route('**/notifications**', (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [MOCK_NOTIFICATIONS[0]],
        meta: { total: 1, unread_count: 1, current_page: 1, last_page: 1, per_page: 15 },
      }),
    });
  });

  await notifPage.filterUnread.click();

  await expect(page.locator('text=New invoice')).toBeVisible();
});

test('clicking notification navigates to linked resource', async ({ page }) => {
  await page.route(`**/invoices/inv-1**`, (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { id: 'inv-1', number: 'INV-001', status: 'sent', total: 100, currency: 'RON', items: [], receipts: [], subsidies: [] } }),
    });
  });

  await page.route('**/notifications/notif-1/read**', (route) => {
    void route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) });
  });

  const notifPage = new NotificationsPage(page);
  await notifPage.waitForLoad();

  await notifPage.notificationCards.first().click();
  await expect(page).toHaveURL(/\/invoices\/inv-1/);
});

test('empty state shown when no notifications', async ({ page }) => {
  await page.route('**/notifications**', (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], meta: { total: 0, unread_count: 0 } }),
    });
  });
  await page.reload();
  await expect(page.locator('.q-spinner-dots')).toBeHidden({ timeout: 8000 });

  const notifPage = new NotificationsPage(page);
  await expect(notifPage.emptyState).toBeVisible();
});
