import { test, expect } from '@playwright/test';
import { mockWorkspaceLookup, mockAuthCheck, mockLogin } from '../fixtures/apiMock';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { UnknownWorkspacePage } from '../pages/UnknownWorkspacePage.po';

test.describe('Tenant error display (Phase 2b end-to-end)', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test('tenant_unknown error on workspace lookup renders UnknownWorkspacePage', async ({ page }) => {
    await mockWorkspaceLookup(page, 'unknown');

    await page.goto(TENANT_BASE_URL + '/');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();

    // i18n key: tenancyError.unknown_workspace_page.title
    await unknownPage.expectTitle(/workspace not available|workspace indisponibil/i);

    // i18n key: tenancyError.unknown_workspace_page.description
    await unknownPage.expectDescription(
      /couldn't open this workspace|link may be wrong|nu am putut deschide/i,
    );
  });

  test('tenant_inactive status renders unknown workspace page', async ({ page }) => {
    await mockWorkspaceLookup(page, 'inactive');

    await page.goto(TENANT_BASE_URL + '/');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();
  });

  test('tenant_archived status renders unknown workspace page', async ({ page }) => {
    await mockWorkspaceLookup(page, 'archived');

    await page.goto(TENANT_BASE_URL + '/');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();
  });

  test('tenant_unknown from login API surfaces translated error string', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAuthCheck(page, 'password');
    await mockLogin(page, 'tenant_unknown');

    await page.goto(TENANT_BASE_URL + '/auth/login');
    await page.locator('input[type="email"], input[type="text"]').first().fill('test@acme.example');
    await page.locator('button', { hasText: /continue|continuă/i }).click();
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').first().click();

    // The FE should surface a translated error — either navigate to unknown-workspace
    // or show a banner with the tenant_unknown i18n key text
    await page.waitForTimeout(1000);

    const isOnErrorPage = page.url().includes('unknown-workspace');
    const hasErrorText = await page
      .locator('text=/couldn\'t find your account|nu am putut găsi contul/i')
      .isVisible()
      .catch(() => false);

    expect(isOnErrorPage || hasErrorText).toBe(true);
  });

  test('tenant_inactive from login API surfaces translated error string', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAuthCheck(page, 'password');
    await mockLogin(page, 'tenant_inactive');

    await page.goto(TENANT_BASE_URL + '/auth/login');
    await page.locator('input[type="email"], input[type="text"]').first().fill('test@acme.example');
    await page.locator('button', { hasText: /continue|continuă/i }).click();
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').first().click();

    await page.waitForTimeout(1000);

    const isOnErrorPage = page.url().includes('unknown-workspace');
    const hasErrorText = await page
      .locator('text=/currently inactive|momentan inactiv/i')
      .isVisible()
      .catch(() => false);

    expect(isOnErrorPage || hasErrorText).toBe(true);
  });

  test('tenant_archived i18n key translates correctly in EN', async ({ page }) => {
    // Navigate directly to the unknown-workspace page with reason=tenant_archived
    await mockWorkspaceLookup(page, 'unknown');

    await page.goto(TENANT_BASE_URL + '/auth/unknown-workspace?reason=tenant_archived');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();

    // i18n key: tenancyError.tenant_archived
    await expect(unknownPage.description).toContainText(/archived|has been archived/i);
  });

  test('tenant_archived i18n key translates correctly in RO', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('locale', 'ro-RO');
    });

    await mockWorkspaceLookup(page, 'unknown');

    await page.goto(TENANT_BASE_URL + '/auth/unknown-workspace?reason=tenant_archived');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();

    // i18n key (ro): tenancyError.tenant_archived → "Acest cont a fost arhivat..."
    await expect(unknownPage.description).toContainText(/arhivat|arhivat/i);
  });
});
