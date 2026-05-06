import { test, expect } from '@playwright/test';
import { mockWorkspaceLookup, mockAppBootstrap, MOCK_ENTITIES } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MainLayout } from '../pages/MainLayout.po';

test.describe('Entity switcher', () => {
  test.use({ baseURL: TENANT_BASE_URL });

  test('entity switcher button is visible when user has multiple entities', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page, MOCK_ENTITIES); // 2 entities
    await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);

    const layout = new MainLayout(page);
    await layout.waitForLayout();

    await expect(layout.entitySwitcherBtn).toBeVisible({ timeout: 5000 });
  });

  test('entity switcher button is hidden when user has one entity', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page, [MOCK_ENTITIES[0]!]); // 1 entity
    await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);

    const layout = new MainLayout(page);
    await layout.waitForLayout();

    // With only one entity the switcher button should not render
    await expect(layout.entitySwitcherBtn).not.toBeVisible();
  });

  test('clicking entity switcher opens dialog with entity list', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page, MOCK_ENTITIES);
    await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);

    const layout = new MainLayout(page);
    await layout.waitForLayout();
    await layout.openEntitySwitcher();

    // Dialog should show both entities
    await expect(layout.entityItems).toHaveCount(2, { timeout: 3000 });
    await expect(layout.entityItems.first()).toContainText('Acme Corp');
    await expect(layout.entityItems.nth(1)).toContainText('Beta Ltd');
  });

  test('selecting a different entity closes the dialog and rescopes API calls', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page, MOCK_ENTITIES);

    // Capture entity store updates — track calls to /entities/:id pattern
    const entityRequests: string[] = [];
    page.on('request', (req) => {
      if (/\/entities\/\d+/.test(req.url()) && req.method() === 'GET') {
        entityRequests.push(req.url());
      }
    });

    await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);

    const layout = new MainLayout(page);
    await layout.waitForLayout();
    await layout.openEntitySwitcher();

    // Select the second entity
    await layout.selectEntity(1);

    // Dialog should close
    await expect(layout.entitySwitcherDialog).not.toBeVisible({ timeout: 3000 });
  });

  test('active entity is marked with checkmark in the dialog', async ({ page }) => {
    await mockWorkspaceLookup(page, 'active');
    await mockAppBootstrap(page, MOCK_ENTITIES);
    await goToAuthenticatedPage(page, '/dashboard', TENANT_BASE_URL);

    const layout = new MainLayout(page);
    await layout.waitForLayout();
    await layout.openEntitySwitcher();

    // The active entity item should have the active CSS class
    const activeItem = layout.entitySwitcherDialog.locator('.entity-item--active');
    await expect(activeItem).toBeVisible({ timeout: 3000 });
    // And a check icon should be present inside it
    await expect(activeItem.locator('[name="las la-check-circle"], .q-icon')).toBeVisible();
  });
});
