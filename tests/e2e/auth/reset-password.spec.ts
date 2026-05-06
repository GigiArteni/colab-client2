import { test, expect } from '@playwright/test';
import {
  mockWorkspaceLookup,
  mockResetPassword,
  mockAppBootstrap,
  DEFAULT_TOKENS,
} from '../fixtures/apiMock';
import { TENANT_BASE_URL, TENANT_SLUG } from '../fixtures/tenantFixtures';

const RESET_URL = `${TENANT_BASE_URL}/password/reset?token=test-reset-token&email=test%40acme.example`;

test.describe('Reset password flow', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test.beforeEach(async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
  });

  test('reset-password request body contains tenant field', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    page.on('request', (req) => {
      if (req.url().includes('/reset-password') && req.method() === 'POST') {
        try {
          capturedBody = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
        } catch {
          // ignore
        }
      }
    });

    await mockResetPassword(page, true);
    await mockAppBootstrap(page);

    await page.goto(RESET_URL);
    await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 8000 });

    await page.locator('input[type="password"]').first().fill('NewPassword123!');
    await page.locator('input[type="password"]').last().fill('NewPassword123!');
    await page.locator('button[type="submit"], button', { hasText: /reset|resetează/i }).first().click();

    await page.waitForResponse((res) => res.url().includes('/reset-password'), { timeout: 5000 });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody!['tenant']).toBe(TENANT_SLUG);
    expect(capturedBody!['token']).toBe('test-reset-token');
    expect(capturedBody!['email']).toBe('test@acme.example');
  });

  test('successful reset auto-logs in and redirects to dashboard', async ({ page }) => {
    await mockResetPassword(page, true, DEFAULT_TOKENS);
    await mockAppBootstrap(page);

    await page.goto(RESET_URL);
    await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 8000 });

    await page.locator('input[type="password"]').first().fill('NewPassword123!');
    await page.locator('input[type="password"]').last().fill('NewPassword123!');
    await page.locator('button[type="submit"], button', { hasText: /reset|resetează/i }).first().click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('invalid/expired token shows error message', async ({ page }) => {
    await mockResetPassword(page, false);

    await page.goto(RESET_URL);
    await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 8000 });

    await page.locator('input[type="password"]').first().fill('NewPassword123!');
    await page.locator('input[type="password"]').last().fill('NewPassword123!');
    await page.locator('button[type="submit"], button', { hasText: /reset|resetează/i }).first().click();

    await expect(
      page.locator('.text-negative, [class*="error"], [role="alert"]').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('mismatched passwords shows validation error without network call', async ({ page }) => {
    let resetCalled = false;
    page.on('request', (req) => {
      if (req.url().includes('/reset-password')) resetCalled = true;
    });

    await page.goto(RESET_URL);
    await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 8000 });

    await page.locator('input[type="password"]').first().fill('NewPassword123!');
    await page.locator('input[type="password"]').last().fill('DifferentPassword456!');
    await page.locator('button[type="submit"], button', { hasText: /reset|resetează/i }).first().click();

    await page.waitForTimeout(500);

    // Should not call API
    expect(resetCalled).toBe(false);
    // Should show a validation error
    await expect(
      page.locator('.text-negative, [class*="error"], [class*="hint"]').first(),
    ).toBeVisible({ timeout: 3000 });
  });
});
