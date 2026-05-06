import { test, expect } from '@playwright/test';
import {
  mockWorkspaceLookup,
  mockAuthCheck,
  mockLogin,
  mockAppBootstrap,
} from '../fixtures/apiMock';
import { TENANT_BASE_URL, TENANT_SLUG } from '../fixtures/tenantFixtures';
import { LoginPage } from '../pages/LoginPage.po';

test.describe('Password login flow', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test.beforeEach(async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
  });

  test('login request body contains tenant field', async ({ page }) => {
    await mockAuthCheck(page, 'password');

    let capturedBody: Record<string, unknown> | null = null;
    page.on('request', (req) => {
      if (req.url().includes('/login') && req.method() === 'POST') {
        try {
          capturedBody = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
        } catch {
          // ignore parse errors
        }
      }
    });

    await mockLogin(page, 'password');
    await mockAppBootstrap(page);

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);

    await loginPage.enterIdentifier('test@acme.example');
    await loginPage.enterPassword('secret123');

    // Wait for the login request to fire
    await page.waitForResponse((res) => res.url().includes('/login'), { timeout: 5000 });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody!['tenant']).toBe(TENANT_SLUG);
  });

  test('auth/check request body contains tenant field', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    page.on('request', (req) => {
      if (req.url().includes('/auth/check') && req.method() === 'POST') {
        try {
          capturedBody = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
        } catch {
          // ignore
        }
      }
    });

    await mockAuthCheck(page, 'password');
    await mockLogin(page, 'password');
    await mockAppBootstrap(page);

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);
    await loginPage.enterIdentifier('test@acme.example');

    await page.waitForResponse((res) => res.url().includes('/auth/check'), { timeout: 5000 });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody!['tenant']).toBe(TENANT_SLUG);
  });

  test('successful password login redirects to dashboard', async ({ page }) => {
    await mockAuthCheck(page, 'password');
    await mockLogin(page, 'password');
    await mockAppBootstrap(page);

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);

    await loginPage.enterIdentifier('test@acme.example');
    await loginPage.enterPassword('secret123');

    // After successful login, app navigates to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
  });

  test('invalid credentials shows error message', async ({ page }) => {
    await mockAuthCheck(page, 'password');
    await mockLogin(page, 'invalid_credentials');

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);

    await loginPage.enterIdentifier('test@acme.example');
    await loginPage.enterPassword('wrongpassword');

    // An error should appear in the UI
    await expect(page.locator('.error-banner, [class*="error"], .text-negative').first()).toBeVisible({
      timeout: 5000,
    });
    // Should stay on login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('back button returns to identifier step', async ({ page }) => {
    await mockAuthCheck(page, 'password');

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);

    await loginPage.enterIdentifier('test@acme.example');
    // Now on password step — back button should return to step 1
    await expect(loginPage.passwordInput).toBeVisible({ timeout: 5000 });
    await loginPage.backBtn.click();
    await expect(loginPage.identifierInput).toBeVisible({ timeout: 3000 });
  });
});
