import { test, expect } from '@playwright/test';
import { mockWorkspaceLookup } from '../fixtures/apiMock';
import { TENANT_BASE_URL, APEX_BASE_URL } from '../fixtures/tenantFixtures';
import { NoWorkspaceLandingPage } from '../pages/NoWorkspaceLandingPage.po';
import { UnknownWorkspacePage } from '../pages/UnknownWorkspacePage.po';

test.describe('Language switch', () => {
  // These tests verify that i18n strings flip when locale changes.
  // We test on pages that don't require auth to keep scope tight.

  test('NoWorkspaceLandingPage renders in English by default', async ({ page }) => {
    test.use({ baseURL: APEX_BASE_URL });

    await page.goto(APEX_BASE_URL + '/');

    const noWorkspacePage = new NoWorkspaceLandingPage(page);
    await noWorkspacePage.waitForVisible();

    // EN: tenancyError.no_workspace_landing.title
    await noWorkspacePage.expectTitle(/you're on the main site/i);
    // EN: tenancyError.no_workspace_landing.description
    await noWorkspacePage.expectDescription(/personalised link/i);
  });

  test('NoWorkspaceLandingPage renders in Romanian when locale is ro-RO', async ({ page }) => {
    test.use({ baseURL: APEX_BASE_URL });

    await page.addInitScript(() => {
      localStorage.setItem('locale', 'ro-RO');
    });

    await page.goto(APEX_BASE_URL + '/');

    const noWorkspacePage = new NoWorkspaceLandingPage(page);
    await noWorkspacePage.waitForVisible();

    // RO: tenancyError.no_workspace_landing.title
    await noWorkspacePage.expectTitle(/te afli pe site-ul principal/i);
    // RO: tenancyError.no_workspace_landing.description
    await noWorkspacePage.expectDescription(/link-ul personalizat/i);
  });

  test('UnknownWorkspacePage renders in English by default', async ({ page }) => {
    test.use({ baseURL: TENANT_BASE_URL });

    await mockWorkspaceLookup(page, 'unknown');
    await page.goto(TENANT_BASE_URL + '/auth/unknown-workspace');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();

    // EN: tenancyError.unknown_workspace_page.title
    await unknownPage.expectTitle(/workspace not available/i);
    // EN: tenancyError.unknown_workspace_page.cta
    await expect(unknownPage.ctaButton).toContainText(/back to main site/i);
  });

  test('UnknownWorkspacePage renders in Romanian when locale is ro-RO', async ({ page }) => {
    test.use({ baseURL: TENANT_BASE_URL });

    await page.addInitScript(() => {
      localStorage.setItem('locale', 'ro-RO');
    });

    await mockWorkspaceLookup(page, 'unknown');
    await page.goto(TENANT_BASE_URL + '/auth/unknown-workspace');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();

    // RO: tenancyError.unknown_workspace_page.title
    await unknownPage.expectTitle(/workspace indisponibil/i);
    // RO: tenancyError.unknown_workspace_page.cta
    await expect(unknownPage.ctaButton).toContainText(/înapoi la site-ul principal/i);
  });

  test('forgot-password page renders in English by default', async ({ page }) => {
    test.use({ baseURL: TENANT_BASE_URL });

    await mockWorkspaceLookup(page, 'active');
    await page.goto(TENANT_BASE_URL + '/auth/forgot-password');

    // EN: forgotPassword.hint
    await expect(page.locator('text=Enter your email address and we will send you a password reset link.')).toBeVisible({
      timeout: 8000,
    });
  });

  test('forgot-password page renders in Romanian when locale is ro-RO', async ({ page }) => {
    test.use({ baseURL: TENANT_BASE_URL });

    await page.addInitScript(() => {
      localStorage.setItem('locale', 'ro-RO');
    });

    await mockWorkspaceLookup(page, 'active');
    await page.goto(TENANT_BASE_URL + '/auth/forgot-password');

    // RO: forgotPassword.hint
    await expect(
      page.locator('text=Introdu adresa de email și îți vom trimite un link pentru resetarea parolei.'),
    ).toBeVisible({ timeout: 8000 });
  });
});
