import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  readonly statCards: Locator;
  readonly unpaidCard: Locator;
  readonly overdueCard: Locator;
  readonly paidCard: Locator;
  readonly subscriptionSection: Locator;
  readonly subscriptionItems: Locator;
  readonly emptyState: Locator;
  readonly spinner: Locator;
  readonly viewAllInvoicesBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statCards = page.locator('.stat-card');
    this.unpaidCard = page.locator('.stat-card--danger');
    this.overdueCard = page.locator('.stat-card--warning');
    this.paidCard = page.locator('.stat-card--success');
    this.subscriptionSection = page.locator('.app-section').filter({ hasText: /subscri/i }).first();
    this.subscriptionItems = page.locator('.app-list-item');
    this.emptyState = page.locator('.empty-state');
    this.spinner = page.locator('.q-spinner-dots');
    this.viewAllInvoicesBtn = page.locator('a[href="/invoices"], .q-btn').filter({ hasText: /invoic/i });
  }

  async waitForLoad(): Promise<void> {
    await expect(this.spinner).toBeHidden({ timeout: 8000 });
  }

  async expectStatCardsVisible(): Promise<void> {
    await expect(this.unpaidCard).toBeVisible();
    await expect(this.overdueCard).toBeVisible();
    await expect(this.paidCard).toBeVisible();
  }
}
