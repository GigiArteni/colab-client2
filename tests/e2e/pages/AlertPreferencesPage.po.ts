import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class AlertPreferencesPage {
  readonly page: Page;

  readonly spinner: Locator;
  readonly browserNotifCard: Locator;
  readonly browserToggle: Locator;
  readonly preferenceRows: Locator;
  readonly enableBrowserBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.spinner = page.locator('.q-spinner-dots');
    this.browserNotifCard = page.locator('.browser-notifications-card');
    this.browserToggle = page.locator('.q-toggle').first();
    this.preferenceRows = page.locator('.preference-row, .q-item');
    this.enableBrowserBtn = page.locator('.q-btn').filter({ hasText: /enable|activează/i });
  }

  async waitForLoad(): Promise<void> {
    await expect(this.spinner).toBeHidden({ timeout: 8000 });
  }
}
