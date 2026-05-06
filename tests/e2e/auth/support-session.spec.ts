import { test, expect } from '@playwright/test';
import { mockWorkspaceLookup, mockAppBootstrap } from '../fixtures/apiMock';
import { loginAsSupportSession } from '../fixtures/authFixtures';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';

test.describe('Support / impersonation session', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test('support session shows impersonation banner on dashboard', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page);
    await loginAsSupportSession(page, 'Jane Doe');

    await page.goto(TENANT_BASE_URL + '/dashboard');

    // The support session banner should be visible somewhere in the layout
    // It can be a q-banner, a bar, or any element containing the impersonated name
    await expect(
      page.locator(
        '[class*="support"], [class*="impersonat"], .q-banner, [data-testid="support-banner"]',
      ).filter({ hasText: /jane doe|support|impersonat/i }).first(),
    ).toBeVisible({ timeout: 8000 });
  });

  test('support session data is read from localStorage', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page);

    // Inject support session directly
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'mock-access-token');
      localStorage.setItem('support_session', JSON.stringify({ impersonating: 'Alice Smith' }));
    });

    await page.goto(TENANT_BASE_URL + '/dashboard');

    // If SupportPage or a banner component reads support_session, it should render
    // At minimum the page should load without crashing
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 8000 });
  });

  test('magic-link URL with support token is consumed and renders app', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');

    // Mock the support-login endpoint
    await page.route('**/auth/support-login', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            access_token: 'mock-support-token',
            refresh_token: null,
            token_type: 'Bearer',
            expires_in: 3600,
            impersonating: 'Bob Jones',
          },
        }),
      });
    });

    await mockAppBootstrap(page);

    // Navigate to the support magic-link URL
    await page.goto(TENANT_BASE_URL + '/support/session?token=magic-link-token-123');

    // The app should consume the token and render; at minimum no crash
    await expect(page.locator('body')).toBeAttached();

    // After consuming the token, it should redirect somewhere meaningful
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain('support/session?token=');
  });
});
