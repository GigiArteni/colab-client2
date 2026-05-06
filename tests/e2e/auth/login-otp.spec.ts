import { test, expect } from '@playwright/test';
import {
  mockWorkspaceLookup,
  mockAuthCheck,
  mockOtpRequest,
  mockOtpVerify,
  mockAppBootstrap,
} from '../fixtures/apiMock';
import { TENANT_BASE_URL, TENANT_SLUG } from '../fixtures/tenantFixtures';
import { LoginPage } from '../pages/LoginPage.po';

test.describe('OTP login flow', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test.beforeEach(async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
  });

  test('OTP request body contains tenant field', async ({ page }) => {
    await mockAuthCheck(page, 'otp');

    let capturedOtpRequestBody: Record<string, unknown> | null = null;
    page.on('request', (req) => {
      if (req.url().includes('/auth/otp/request') && req.method() === 'POST') {
        try {
          capturedOtpRequestBody = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
        } catch {
          // ignore
        }
      }
    });

    await mockOtpRequest(page);
    await mockOtpVerify(page, true);
    await mockAppBootstrap(page);

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);

    await loginPage.enterIdentifier('test@acme.example');

    // OTP channel step — select email channel
    await page.waitForTimeout(500);
    await loginPage.otpChannelEmail.click();

    await page.waitForResponse((res) => res.url().includes('/auth/otp/request'), { timeout: 5000 });

    expect(capturedOtpRequestBody).not.toBeNull();
    expect(capturedOtpRequestBody!['tenant']).toBe(TENANT_SLUG);
  });

  test('OTP verify request body contains tenant field', async ({ page }) => {
    await mockAuthCheck(page, 'otp');
    await mockOtpRequest(page);

    let capturedVerifyBody: Record<string, unknown> | null = null;
    page.on('request', (req) => {
      if (req.url().includes('/auth/otp/verify') && req.method() === 'POST') {
        try {
          capturedVerifyBody = JSON.parse(req.postData() ?? '{}') as Record<string, unknown>;
        } catch {
          // ignore
        }
      }
    });

    await mockOtpVerify(page, true);
    await mockAppBootstrap(page);

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);

    await loginPage.enterIdentifier('test@acme.example');
    await page.waitForTimeout(300);
    await loginPage.otpChannelEmail.click();
    await page.waitForResponse((res) => res.url().includes('/auth/otp/request'), { timeout: 5000 });

    // Now on code step
    await loginPage.enterOtpCode('123456');

    await page.waitForResponse((res) => res.url().includes('/auth/otp/verify'), { timeout: 5000 });

    expect(capturedVerifyBody).not.toBeNull();
    expect(capturedVerifyBody!['tenant']).toBe(TENANT_SLUG);
  });

  test('successful OTP flow redirects to dashboard', async ({ page }) => {
    await mockAuthCheck(page, 'otp');
    await mockOtpRequest(page);
    await mockOtpVerify(page, true);
    await mockAppBootstrap(page);

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);

    await loginPage.enterIdentifier('test@acme.example');
    await page.waitForTimeout(300);
    await loginPage.otpChannelEmail.click();
    await page.waitForResponse((res) => res.url().includes('/auth/otp/request'), { timeout: 5000 });
    await loginPage.enterOtpCode('123456');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8000 });
  });

  test('invalid OTP code shows error without leaving the code step', async ({ page }) => {
    await mockAuthCheck(page, 'otp');
    await mockOtpRequest(page);
    await mockOtpVerify(page, false);

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);

    await loginPage.enterIdentifier('test@acme.example');
    await page.waitForTimeout(300);
    await loginPage.otpChannelEmail.click();
    await page.waitForResponse((res) => res.url().includes('/auth/otp/request'), { timeout: 5000 });
    await loginPage.enterOtpCode('000000');

    await expect(page.locator('.text-negative, [class*="error"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('check auth request contains portal=customer', async ({ page }) => {
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

    await mockAuthCheck(page, 'otp');

    const loginPage = new LoginPage(page);
    await loginPage.goto(TENANT_BASE_URL);
    await loginPage.identifierInput.fill('test@acme.example');
    await loginPage.continueBtn.click();

    await page.waitForResponse((res) => res.url().includes('/auth/check'), { timeout: 5000 });

    expect(capturedBody).not.toBeNull();
    expect(capturedBody!['portal']).toBe('customer');
    expect(capturedBody!['tenant']).toBe(TENANT_SLUG);
  });
});
