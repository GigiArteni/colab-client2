import { test, expect } from '@playwright/test';
import { TENANT_BASE_URL } from '../fixtures/tenantFixtures';
import { MOCK_USER } from '../fixtures/apiMock';
import { goToAuthenticatedPage } from '../fixtures/authFixtures';
import { ProfilePage } from '../pages/ProfilePage.po';

test.use({ baseURL: TENANT_BASE_URL });

test.beforeEach(async ({ page }) => {
  await goToAuthenticatedPage(page, '/profile', TENANT_BASE_URL);
});

test('renders user display name and email', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await expect(page.locator(`text=${MOCK_USER.name}`)).toBeVisible();
  await expect(page.locator(`text=${MOCK_USER.email}`)).toBeVisible();
});

test('shows phone number', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await expect(page.locator(`text=${MOCK_USER.phone}`)).toBeVisible();
});

test('shows suppliers/entities card', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await expect(profile.suppliersCard).toBeVisible();
});

test('shows three tabs: settings, contact, devices', async ({ page }) => {
  const profile = new ProfilePage(page);
  await profile.waitForLoad();

  await expect(profile.tabSettings).toBeVisible();
  await expect(profile.tabContact).toBeVisible();
  await expect(profile.tabDevices).toBeVisible();
});
