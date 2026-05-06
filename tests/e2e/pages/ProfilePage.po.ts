import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  readonly spinner: Locator;
  readonly displayName: Locator;
  readonly email: Locator;
  readonly phone: Locator;
  readonly tabSettings: Locator;
  readonly tabContact: Locator;
  readonly tabDevices: Locator;
  readonly changePasswordItem: Locator;
  readonly logoutItem: Locator;
  readonly suppliersCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.spinner = page.locator('.q-spinner-dots');
    this.displayName = page.locator('.text-h6').first();
    this.email = page.locator('.q-item-label').filter({ hasText: /@/ }).first();
    this.phone = page.locator('.q-item-label').filter({ hasText: /\+/ }).first();
    this.tabSettings = page.locator('.q-tab[name="settings"]');
    this.tabContact = page.locator('.q-tab[name="contact"]');
    this.tabDevices = page.locator('.q-tab[name="devices"]');
    this.changePasswordItem = page.locator('.q-item').filter({ hasText: /password|parolă/i });
    this.logoutItem = page.locator('.q-item').filter({ hasText: /logout|deconect/i });
    this.suppliersCard = page.locator('.q-card').filter({ hasText: /supplier|furnizor/i });
  }

  async waitForLoad(): Promise<void> {
    await expect(this.spinner).toBeHidden({ timeout: 8000 });
  }

  async switchToTab(tab: 'settings' | 'contact' | 'devices'): Promise<void> {
    const tabMap = { settings: this.tabSettings, contact: this.tabContact, devices: this.tabDevices };
    await tabMap[tab].click();
  }
}
