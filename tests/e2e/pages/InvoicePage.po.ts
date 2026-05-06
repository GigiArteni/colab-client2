import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class InvoiceListPage {
  readonly page: Page;

  readonly title: Locator;
  readonly spinner: Locator;
  readonly invoiceCards: Locator;
  readonly emptyState: Locator;
  readonly statusToggle: Locator;
  readonly utilityFilter: Locator;
  readonly unpaidSection: Locator;
  readonly paidSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('.text-h5').filter({ hasText: /factur/i });
    this.spinner = page.locator('.q-spinner-dots');
    this.invoiceCards = page.locator('.q-card').filter({ hasText: /RON|lei/i });
    this.emptyState = page.locator('.q-card').filter({ hasText: /no.*invoic|facturi/i });
    this.statusToggle = page.locator('.q-btn-toggle');
    this.utilityFilter = page.locator('.q-select');
    this.unpaidSection = page.locator('.text-negative').filter({ hasText: /unpaid|neplătit/i });
    this.paidSection = page.locator('.text-positive').filter({ hasText: /paid|plătit/i });
  }

  async waitForLoad(): Promise<void> {
    await expect(this.spinner).toBeHidden({ timeout: 8000 });
  }
}

export class InvoiceDetailPage {
  readonly page: Page;

  readonly spinner: Locator;
  readonly backBtn: Locator;
  readonly tabDetail: Locator;
  readonly tabHistory: Locator;
  readonly itemsTable: Locator;
  readonly receiptsList: Locator;
  readonly downloadPdfBtn: Locator;
  readonly payBtn: Locator;
  readonly notFound: Locator;

  constructor(page: Page) {
    this.page = page;
    this.spinner = page.locator('.q-spinner-dots');
    this.backBtn = page.locator('.q-btn').filter({ hasText: /back|înapoi/i }).first();
    this.tabDetail = page.locator('.q-tab[name="detail"]');
    this.tabHistory = page.locator('.q-tab[name="history"]');
    this.itemsTable = page.locator('table, .invoice-items');
    this.receiptsList = page.locator('.receipts-list, .q-list').filter({ hasText: /receipt|plată/i });
    this.downloadPdfBtn = page.locator('.q-btn').filter({ hasText: /pdf|download|descarcă/i });
    this.payBtn = page.locator('.q-btn').filter({ hasText: /pay|plătește/i });
    this.notFound = page.locator('.q-card').filter({ hasText: /not found|negăsit/i });
  }

  async waitForLoad(): Promise<void> {
    await expect(this.spinner).toBeHidden({ timeout: 8000 });
  }

  async switchToHistory(): Promise<void> {
    await this.tabHistory.click();
  }
}
