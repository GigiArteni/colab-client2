import { test, expect } from '@playwright/test';
import { mockWorkspaceLookup, mockForgotPassword } from '../fixtures/apiMock';
import { TENANT_BASE_URL, TENANT_SLUG } from '../fixtures/tenantFixtures';

test.describe('Forgot password flow', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test.beforeEach(async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
  });

  test('forgot-password request body contains tenant field', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    page.on('request', (req) => {
      if (req.url().includes('/forgot-password') && req.method() === 'POST') {
        try {
          capturedBody = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
        } catch {
          // ignore
        }
      }
    });

    await mockForgotPassword(page, true);

    await page.goto(TENANT_BASE_URL + '/auth/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 8000 });

    await page.locator('input[type="email"]').fill('test@acme.example');
    await page.locator('button[type="submit"], button', { hasText: /send|trimite/i }).first().click();

    await page.waitForResponse((res) => res.url().includes('/forgot-password'), { timeout: 5000 });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody!['tenant']).toBe(TENANT_SLUG);
    expect(capturedBody!['email']).toBe('test@acme.example');
  });

  test('success shows translated confirmation message in EN', async ({ page }) => {
    await mockForgotPassword(page, true);

    await page.goto(TENANT_BASE_URL + '/auth/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 8000 });

    await page.locator('input[type="email"]').fill('test@acme.example');
    await page.locator('button[type="submit"], button', { hasText: /send|trimite/i }).first().click();

    // EN success message from i18n: forgotPassword.checkEmail
    await expect(
      page.locator('text=Check your email for password reset instructions.'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('success shows translated confirmation message in RO', async ({ page }) => {
    await mockForgotPassword(page, true);

    // Switch locale to ro-RO via localStorage before navigating
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'ro-RO');
    });

    await page.goto(TENANT_BASE_URL + '/auth/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 8000 });

    await page.locator('input[type="email"]').fill('test@acme.example');
    await page.locator('button[type="submit"], button', { hasText: /send|trimite/i }).first().click();

    // RO success message from i18n: forgotPassword.checkEmail
    await expect(
      page.locator('text=Verifică-ți email-ul pentru instrucțiuni de resetare a parolei.'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('back to login link navigates to login page', async ({ page }) => {
    await page.goto(TENANT_BASE_URL + '/auth/forgot-password');
    await expect(page.locator('a, button', { hasText: /back to login|înapoi la autentificare/i }).first()).toBeVisible({ timeout: 8000 });

    await page.locator('a, button', { hasText: /back to login|înapoi la autentificare/i }).first().click();
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
  });
});
