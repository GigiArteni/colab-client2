import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class NotificationsPage {
  readonly page: Page;

  readonly spinner: Locator;
  readonly unreadBadge: Locator;
  readonly markAllReadBtn: Locator;
  readonly filterAll: Locator;
  readonly filterUnread: Locator;
  readonly notificationCards: Locator;
  readonly emptyState: Locator;
  readonly loadMoreBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.spinner = page.locator('.q-spinner-dots');
    this.unreadBadge = page.locator('.notifications-header__badge');
    this.markAllReadBtn = page.locator('.mark-all-btn');
    this.filterAll = page.locator('.filter-toggle__btn').first();
    this.filterUnread = page.locator('.filter-toggle__btn').last();
    this.notificationCards = page.locator('.notification-card');
    this.emptyState = page.locator('.empty-state');
    this.loadMoreBtn = page.locator('.load-more__btn');
  }

  async waitForLoad(): Promise<void> {
    await expect(this.spinner).toBeHidden({ timeout: 8000 });
  }
}
