import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Page Object for MainLayout.
 * Covers: header/brand, bottom nav, entity switcher dialog, user menu.
 */
export class MainLayout {
  readonly page: Page;

  // Header
  readonly header: Locator;
  readonly brand: Locator;
  readonly brandName: Locator;
  readonly entitySwitcherBtn: Locator;
  readonly userAvatarBtn: Locator;

  // Bottom nav
  readonly bottomNav: Locator;
  readonly navDashboard: Locator;
  readonly navInvoices: Locator;
  readonly navMeters: Locator;
  readonly navSubscriptions: Locator;
  readonly navProfile: Locator;

  // Entity Switcher dialog
  readonly entitySwitcherDialog: Locator;
  readonly entityItems: Locator;

  // User menu dialog
  readonly userMenuDialog: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.header = page.locator('.app-header');
    this.brand = page.locator('.app-brand');
    this.brandName = page.locator('.app-brand__name');
    this.entitySwitcherBtn = page.locator('.app-header-btn').filter({ has: page.locator('[name="las la-exchange-alt"]') });
    this.userAvatarBtn = page.locator('.app-avatar').first();

    // Bottom nav — use nav items by their to= path
    this.bottomNav = page.locator('.app-nav');
    this.navDashboard = page.locator('.app-nav__item[href="/dashboard"], a[href="/dashboard"]');
    this.navInvoices = page.locator('.app-nav__item[href="/invoices"], a[href="/invoices"]');
    this.navMeters = page.locator('.app-nav__item[href="/meters"], a[href="/meters"]');
    this.navSubscriptions = page.locator('.app-nav__item[href="/subscriptions"], a[href="/subscriptions"]');
    this.navProfile = page.locator('.app-nav__item[href="/profile"], a[href="/profile"]');

    // Entity Switcher dialog
    this.entitySwitcherDialog = page.locator('.entity-switcher-card');
    this.entityItems = page.locator('.entity-item');

    // User menu dialog
    this.userMenuDialog = page.locator('.user-menu-card');
    this.logoutBtn = page.locator('.user-menu-list .q-item', { hasText: /logout|deconectare/i });
  }

  async waitForLayout(): Promise<void> {
    await expect(this.header).toBeVisible({ timeout: 8000 });
    await expect(this.bottomNav).toBeVisible({ timeout: 8000 });
  }

  async openEntitySwitcher(): Promise<void> {
    await this.entitySwitcherBtn.click();
    await expect(this.entitySwitcherDialog).toBeVisible({ timeout: 3000 });
  }

  async selectEntity(index: number): Promise<void> {
    await this.entityItems.nth(index).click();
  }

  async openUserMenu(): Promise<void> {
    await this.userAvatarBtn.click();
    await expect(this.userMenuDialog).toBeVisible({ timeout: 3000 });
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.logoutBtn.click();
  }

  async expectNavItemActive(navItem: 'dashboard' | 'invoices' | 'meters' | 'subscriptions' | 'profile'): Promise<void> {
    const itemMap: Record<string, Locator> = {
      dashboard: this.navDashboard,
      invoices: this.navInvoices,
      meters: this.navMeters,
      subscriptions: this.navSubscriptions,
      profile: this.navProfile,
    };
    const item = itemMap[navItem]!;
    await expect(item).toHaveClass(/app-nav__item--active/);
  }

  async clickNavItem(navItem: 'dashboard' | 'invoices' | 'meters' | 'subscriptions' | 'profile'): Promise<void> {
    const itemMap: Record<string, Locator> = {
      dashboard: this.navDashboard,
      invoices: this.navInvoices,
      meters: this.navMeters,
      subscriptions: this.navSubscriptions,
      profile: this.navProfile,
    };
    await itemMap[navItem]!.click();
  }
}
