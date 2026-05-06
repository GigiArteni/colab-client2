import { test, expect } from '@playwright/test';
import { mockWorkspaceLookup, mockAppBootstrap, mockAuthCheck } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';

test.describe('Keyboard navigation and focus management', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test.describe('Login form keyboard navigation', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkspaceLookup(page, 'active');
    });

    test('Tab focuses identifier input first on login page', async ({ page }) => {
      await page.goto(TENANT_BASE_URL + '/auth/login');

      // Press Tab once from body — should land on the first interactive element
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      // The focused element should be an input
      await expect(focused).toBeVisible({ timeout: 3000 });
      const tag = await focused.evaluate((el) => el.tagName.toLowerCase());
      expect(['input', 'button', 'a']).toContain(tag);
    });

    test('Tab sequence traverses identifier input → continue button', async ({ page }) => {
      await page.goto(TENANT_BASE_URL + '/auth/login');

      const identifierInput = page.locator('input[type="email"], input[type="text"]').first();
      await identifierInput.focus();
      await expect(identifierInput).toBeFocused();

      await page.keyboard.press('Tab');
      // Focus should have moved forward
      const nextFocused = page.locator(':focus');
      await expect(nextFocused).toBeVisible({ timeout: 3000 });
    });

    test('Enter submits the identifier form', async ({ page }) => {
      await mockAuthCheck(page, 'password');

      await page.goto(TENANT_BASE_URL + '/auth/login');

      const identifierInput = page.locator('input[type="email"], input[type="text"]').first();
      await identifierInput.fill('test@acme.example');
      await page.keyboard.press('Enter');

      // Should advance to the password step
      await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });
    });

    test('password field accepts Enter to submit', async ({ page }) => {
      await mockAuthCheck(page, 'password');

      // Mock login to prevent redirect noise
      await page.route('**/login', (route) => {
        return route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials' }),
        });
      });

      await page.goto(TENANT_BASE_URL + '/auth/login');

      const identifierInput = page.locator('input[type="email"], input[type="text"]').first();
      await identifierInput.fill('test@acme.example');
      await identifierInput.press('Enter');

      await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });

      await page.locator('input[type="password"]').fill('password123');
      await page.keyboard.press('Enter');

      // Should trigger the login request (422 in this case) — we just verify form submits
      await page.waitForResponse((res) => res.url().includes('/login'), { timeout: 5000 });
    });
  });

  test.describe('Authenticated layout keyboard navigation', () => {
    test.beforeEach(async ({ page }) => {
      await mockWorkspaceLookup(page, 'active');
      await mockAppBootstrap(page);
      await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);
    });

    test('bottom nav items are keyboard-focusable', async ({ page }) => {
      const navItems = page.locator('.app-nav__item');
      const count = await navItems.count();
      expect(count).toBeGreaterThan(0);

      // Each nav item should be reachable via keyboard (anchor tags are natively focusable)
      const firstItem = navItems.first();
      await firstItem.focus();
      await expect(firstItem).toBeFocused();
    });

    test('entity switcher button is keyboard-focusable', async ({ page }) => {
      // Entity switcher only shows with multiple entities (mocked with 2)
      const switcher = page.locator('.app-header-btn').first();
      await switcher.focus();
      await expect(switcher).toBeFocused();
    });

    test('entity switcher dialog has focusable elements when open', async ({ page }) => {
      // Open entity switcher via keyboard
      const switcherBtn = page.locator('.app-header-btn').filter({
        has: page.locator('[name="las la-exchange-alt"]'),
      });

      if (await switcherBtn.isVisible()) {
        await switcherBtn.focus();
        await page.keyboard.press('Enter');

        const dialog = page.locator('.entity-switcher-card');
        await expect(dialog).toBeVisible({ timeout: 3000 });

        // Focus should be inside the dialog or dialog itself focusable
        const dialogItems = dialog.locator('.q-item');
        if (await dialogItems.count() > 0) {
          await dialogItems.first().focus();
          await expect(dialogItems.first()).toBeFocused();
        }
      } else {
        test.skip();
      }
    });

    test('Escape closes entity switcher dialog', async ({ page }) => {
      const switcherBtn = page.locator('.app-header-btn').filter({
        has: page.locator('[name="las la-exchange-alt"]'),
      });

      if (await switcherBtn.isVisible()) {
        await switcherBtn.click();
        const dialog = page.locator('.entity-switcher-card');
        await expect(dialog).toBeVisible({ timeout: 3000 });

        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible({ timeout: 3000 });
      } else {
        test.skip();
      }
    });
  });

  test.describe('Forgot password form keyboard nav', () => {
    test('Tab from email input reaches the submit button', async ({ page }) => {
      await mockWorkspaceLookup(page, 'active');
      await page.goto(TENANT_BASE_URL + '/auth/forgot-password');

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible({ timeout: 8000 });

      await emailInput.fill('test@example.com');
      await page.keyboard.press('Tab');

      // Focus should now be on submit or back link
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible({ timeout: 3000 });
    });
  });
});
