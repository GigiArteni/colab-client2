import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { mockWorkspaceLookup } from '../fixtures/apiMock';

const BASE = 'http://localhost:9000';

// Pages that require authentication
const AUTH_PAGES = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'invoices', path: '/invoices' },
  { name: 'profile', path: '/profile' },
];

// Pages accessible without auth
const PUBLIC_PAGES = [
  { name: 'login', path: '/auth/login' },
];

for (const { name, path } of AUTH_PAGES) {
  test(`${name}: zero axe violations`, async ({ page }) => {
    await goToAuthenticatedPage(page, path, BASE);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.q-tooltip') // Quasar tooltips rendered in portal, not interactive
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

for (const { name, path } of PUBLIC_PAGES) {
  test(`${name}: zero axe violations`, async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    // Set tenant slug so the auth guard doesn't redirect to select-workspace
    await page.addInitScript(() => {
      localStorage.setItem('tenant.slug', 'acme');
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.q-tooltip')
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
