import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Page Object for LoginPage (/auth/login).
 *
 * The login flow is multi-step:
 *   Step 1 — Enter email/phone (LoginEmailStep)
 *   Step 'password' — Enter password (LoginPasswordStep)
 *   Step 2 — Choose OTP channel (LoginOtpStep)
 *   Step 3 — Enter OTP code (LoginOtpCodeStep)
 *   Step 'mfa' — Enter MFA/TOTP code (LoginMfaStep)
 */
export class LoginPage {
  readonly page: Page;

  // Step 1 — email input
  readonly identifierInput: Locator;
  readonly continueBtn: Locator;

  // Step password
  readonly passwordInput: Locator;
  readonly loginBtn: Locator;
  readonly backBtn: Locator;

  // Step OTP channel select
  readonly otpChannelEmail: Locator;
  readonly otpChannelSms: Locator;

  // Step OTP code
  readonly otpCodeInput: Locator;
  readonly verifyOtpBtn: Locator;
  readonly resendOtpBtn: Locator;

  // Step MFA
  readonly mfaCodeInput: Locator;
  readonly verifyMfaBtn: Locator;

  // Step indicators
  readonly stepDots: Locator;

  // Error display
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1
    this.identifierInput = page.locator('input[type="email"], input[type="text"]').first();
    this.continueBtn = page.locator('button', { hasText: /continue|continuă/i });

    // Step password
    this.passwordInput = page.locator('input[type="password"]');
    this.loginBtn = page.locator('button[type="submit"]').first();
    this.backBtn = page.locator('button', { hasText: /back|înapoi/i });

    // OTP channel select
    this.otpChannelEmail = page.locator('[data-channel="email"], .q-item', { hasText: /email/i }).first();
    this.otpChannelSms = page.locator('[data-channel="sms"], .q-item', { hasText: /sms/i }).first();

    // OTP code
    this.otpCodeInput = page.locator('input[maxlength], input[type="text"]').last();
    this.verifyOtpBtn = page.locator('button', { hasText: /verify|verifică/i }).first();
    this.resendOtpBtn = page.locator('button', { hasText: /resend|retrimite/i });

    // MFA
    this.mfaCodeInput = page.locator('input[type="text"], input[inputmode="numeric"]').last();
    this.verifyMfaBtn = page.locator('button', { hasText: /verify|verifică/i }).first();

    // Misc
    this.stepDots = page.locator('.step-dot');
    this.errorBanner = page.locator('.error-banner, [role="alert"], .text-negative').first();
  }

  async goto(baseURL: string): Promise<void> {
    await this.page.goto(`${baseURL}/auth/login`);
  }

  async enterIdentifier(identifier: string): Promise<void> {
    await this.identifierInput.fill(identifier);
    await this.continueBtn.click();
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
    await this.loginBtn.click();
  }

  async selectOtpChannel(channel: 'email' | 'sms'): Promise<void> {
    if (channel === 'email') {
      await this.otpChannelEmail.click();
    } else {
      await this.otpChannelSms.click();
    }
  }

  async enterOtpCode(code: string): Promise<void> {
    await this.otpCodeInput.fill(code);
    await this.verifyOtpBtn.click();
  }

  async enterMfaCode(code: string): Promise<void> {
    await this.mfaCodeInput.fill(code);
    await this.verifyMfaBtn.click();
  }

  async waitForStep(step: 'email' | 'password' | 'otp-channel' | 'otp-code' | 'mfa'): Promise<void> {
    const stepSelectors: Record<string, string> = {
      email: 'input[type="email"], input[placeholder*="email" i]',
      password: 'input[type="password"]',
      'otp-channel': '.q-item[class*="channel"], .q-list',
      'otp-code': 'input[maxlength]',
      mfa: '[class*="mfa"], [class*="totp"]',
    };
    const selector = stepSelectors[step];
    if (selector) {
      await expect(this.page.locator(selector).first()).toBeVisible({ timeout: 5000 });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async expectRequestContainsTenant(_slug: string): Promise<string> {
    // Returns the captured request body for assertion
    const requestBody = await this.page.evaluate(() => {
      return (window as unknown as Record<string, unknown>)['__lastAuthBody'] as string;
    });
    return requestBody;
  }
}
