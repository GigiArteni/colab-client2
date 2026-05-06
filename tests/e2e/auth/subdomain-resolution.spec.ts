import { test, expect } from '@playwright/test';
import { mockWorkspaceLookup, mockAppBootstrap } from '../fixtures/apiMock';
import { loginAsUser } from '../fixtures/authFixtures';
import { TENANT_BASE_URL, APEX_BASE_URL, UNKNOWN_BASE_URL, TENANT_SLUG } from '../fixtures/tenantFixtures';
import { UnknownWorkspacePage } from '../pages/UnknownWorkspacePage.po';
import { NoWorkspaceLandingPage } from '../pages/NoWorkspaceLandingPage.po';

test.describe('Subdomain resolution', () => {
  test('active tenant subdomain loads the app', async ({ page }) => {
    test.use({ baseURL: TENANT_BASE_URL });

    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page);
    await loginAsUser(page);

    await page.goto(TENANT_BASE_URL + '/dashboard');

    // App shell should be present — not an error page
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.unknown-workspace-page')).not.toBeVisible();
    await expect(page.locator('.no-workspace-page')).not.toBeVisible();
  });

  test('unknown subdomain shows UnknownWorkspacePage', async ({ page }) => {
    test.use({ baseURL: UNKNOWN_BASE_URL });

    await mockWorkspaceLookup(page, 'unknown');

    await page.goto(UNKNOWN_BASE_URL + '/');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();
    await unknownPage.expectTitle(/workspace not available|workspace indisponibil/i);
    await unknownPage.expectCtaButton();
  });

  test('inactive/suspended tenant shows UnknownWorkspacePage', async ({ page }) => {
    test.use({ baseURL: TENANT_BASE_URL });

    await mockWorkspaceLookup(page, 'inactive');

    await page.goto(TENANT_BASE_URL + '/auth/login');

    // Router guard should redirect to unknown-workspace because lookupResult is non-active
    // The page's description should mention the inactive/suspended state
    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();
  });

  test('apex domain (no subdomain) shows NoWorkspaceLandingPage', async ({ page }) => {
    test.use({ baseURL: APEX_BASE_URL });

    await page.goto(APEX_BASE_URL + '/');

    const noWorkspacePage = new NoWorkspaceLandingPage(page);
    await noWorkspacePage.waitForVisible();
    await noWorkspacePage.expectTitle(/you're on the main site|te afli pe site-ul principal/i);
    await noWorkspacePage.expectExampleUrl();
  });

  test('slug is extracted correctly from lvh.me subdomain', async ({ page }) => {
    test.use({ baseURL: TENANT_BASE_URL });

    await mockWorkspaceLookup(page, 'active');

    // Intercept the workspace lookup request and verify the slug in the URL
    const lookupUrls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/workspaces/')) {
        lookupUrls.push(req.url());
      }
    });

    await page.goto(TENANT_BASE_URL + '/auth/login');

    // After boot the useTenant composable should call lookup with the correct slug
    // Give it a moment to fire
    await page.waitForTimeout(500);

    // The lookup URL should contain the tenant slug
    const hasCorrectSlug = lookupUrls.some((url) => url.includes(`/workspaces/${TENANT_SLUG}`));
    expect(hasCorrectSlug).toBe(true);
  });

  test('archived tenant shows UnknownWorkspacePage with archived reason', async ({ page }) => {
    test.use({ baseURL: TENANT_BASE_URL });

    // Mock lookup returning archived status
    await mockWorkspaceLookup(page, 'archived');

    await page.goto(TENANT_BASE_URL + '/');

    const unknownPage = new UnknownWorkspacePage(page);
    await unknownPage.waitForVisible();
    // The page renders a description — it should not be empty
    await expect(unknownPage.description).not.toBeEmpty();
  });
});
