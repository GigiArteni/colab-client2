import type { Page } from '@playwright/test';
import { DEFAULT_TOKENS, MOCK_USER, mockAppBootstrap, mockWorkspaceLookup } from './apiMock';

/**
 * Set the application into an authenticated state by writing tokens into
 * localStorage and mocking the bootstrap API calls.
 *
 * Call this BEFORE navigating to any protected route so the router guard
 * finds `access_token` in localStorage and skips the login redirect.
 */
export async function loginAsUser(page: Page): Promise<void> {
  // Prime localStorage before the app boots.
  // We use addInitScript so it runs before any page JS.
  await page.addInitScript(
    ({ token, user }: { token: string; user: typeof MOCK_USER }) => {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { token: DEFAULT_TOKENS.access_token, user: MOCK_USER },
  );
}

/**
 * Simulate a support/impersonation session by writing an impersonation
 * marker into localStorage so the SupportPage banner is visible.
 */
export async function loginAsSupportSession(page: Page, targetUserName = 'Jane Doe'): Promise<void> {
  await page.addInitScript(
    ({ token, supportUser }: { token: string; supportUser: string }) => {
      localStorage.setItem('access_token', token);
      localStorage.setItem('support_session', JSON.stringify({ impersonating: supportUser }));
    },
    { token: DEFAULT_TOKENS.access_token, supportUser: targetUserName },
  );
}

/**
 * Clear all auth state — simulates a logged-out / first-visit user.
 */
export async function clearAuthState(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('support_session');
  });
}

/**
 * Full helper: mock workspace + set tokens + mock bootstrap, then navigate.
 * Use when you want to land directly on a protected page as an authenticated user.
 */
export async function goToAuthenticatedPage(
  page: Page,
  path: string,
  baseUrl: string,
): Promise<void> {
  await mockWorkspaceLookup(page, 'active');
  await mockAppBootstrap(page);
  await loginAsUser(page);
  await page.goto(`${baseUrl}${path}`);
}
