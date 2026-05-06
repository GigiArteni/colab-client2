import { test, expect } from '@playwright/test';
import { mockWorkspaceLookup, mockAppBootstrap } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MainLayout } from '../pages/MainLayout.po';

// Mobile nav tests run on mobile viewport sizes (chromium-mobile / webkit-mobile projects)
// They also pass on desktop (bottom nav is always visible in MainLayout).

test.describe('Mobile bottom navigation', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test.beforeEach(async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page);
    await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);
  });

  test('bottom nav is visible with 5 items', async ({ page }) => {
    const layout = new MainLayout(page);
    await layout.waitForLayout();

    await expect(layout.bottomNav).toBeVisible();
    const navItems = page.locator('.app-nav__item');
    await expect(navItems).toHaveCount(5);
  });

  test('dashboard nav item is active on /dashboard', async ({ page }) => {
    const layout = new MainLayout(page);
    await layout.waitForLayout();

    await layout.expectNavItemActive('dashboard');
  });

  test('invoices nav item becomes active after navigating to /invoices', async ({ page }) => {
    const layout = new MainLayout(page);
    await layout.waitForLayout();

    await layout.clickNavItem('invoices');
    await expect(page).toHaveURL(/\/invoices/, { timeout: 5000 });
    await layout.expectNavItemActive('invoices');
  });

  test('meters nav item becomes active after navigating to /meters', async ({ page }) => {
    const layout = new MainLayout(page);
    await layout.waitForLayout();

    await layout.clickNavItem('meters');
    await expect(page).toHaveURL(/\/meters/, { timeout: 5000 });
    await layout.expectNavItemActive('meters');
  });

  test('subscriptions nav item becomes active after navigating to /subscriptions', async ({ page }) => {
    const layout = new MainLayout(page);
    await layout.waitForLayout();

    await layout.clickNavItem('subscriptions');
    await expect(page).toHaveURL(/\/subscriptions/, { timeout: 5000 });
    await layout.expectNavItemActive('subscriptions');
  });

  test('profile nav item becomes active after navigating to /profile', async ({ page }) => {
    const layout = new MainLayout(page);
    await layout.waitForLayout();

    await layout.clickNavItem('profile');
    await expect(page).toHaveURL(/\/profile/, { timeout: 5000 });
    await layout.expectNavItemActive('profile');
  });

  test('only one nav item is active at a time', async ({ page }) => {
    const layout = new MainLayout(page);
    await layout.waitForLayout();

    // Navigate to invoices
    await layout.clickNavItem('invoices');
    await expect(page).toHaveURL(/\/invoices/, { timeout: 5000 });

    // Only the invoices item should be active
    const activeItems = page.locator('.app-nav__item--active');
    await expect(activeItems).toHaveCount(1);
    await expect(activeItems.first()).toHaveAttribute('href', '/invoices');
  });

  test('brand click navigates to dashboard from any page', async ({ page }) => {
    const layout = new MainLayout(page);
    await layout.waitForLayout();

    // Go to a different page first
    await layout.clickNavItem('invoices');
    await expect(page).toHaveURL(/\/invoices/, { timeout: 5000 });

    // Click brand
    await layout.brand.click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });
});
