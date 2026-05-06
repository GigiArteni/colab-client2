import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class MeterListPage {
  readonly page: Page;

  readonly spinner: Locator;
  readonly meterCards: Locator;
  readonly emptyState: Locator;
  readonly activeChip: Locator;
  readonly totalChip: Locator;

  constructor(page: Page) {
    this.page = page;
    this.spinner = page.locator('.q-spinner-dots');
    this.meterCards = page.locator('.meter-card');
    this.emptyState = page.locator('.q-card').filter({ hasText: /no.*meter|contoare/i });
    this.activeChip = page.locator('.q-chip').filter({ hasText: /active|activ/i }).first();
    this.totalChip = page.locator('.q-chip').filter({ hasText: /total/i }).first();
  }

  async waitForLoad(): Promise<void> {
    await expect(this.spinner).toBeHidden({ timeout: 8000 });
  }
}

export class MeterDetailPage {
  readonly page: Page;

  readonly spinner: Locator;
  readonly serialNumber: Locator;
  readonly readingsHistory: Locator;
  readonly submitReadingBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.spinner = page.locator('.q-spinner-dots');
    this.serialNumber = page.locator('.text-subtitle1, .text-h6').first();
    this.readingsHistory = page.locator('.readings-history, .q-list, table').first();
    this.submitReadingBtn = page.locator('.q-btn').filter({ hasText: /submit|trimite/i });
  }

  async waitForLoad(): Promise<void> {
    await expect(this.spinner).toBeHidden({ timeout: 8000 });
  }
}

export class MeterSubmitReadingPage {
  readonly page: Page;

  readonly valueInput: Locator;
  readonly submitBtn: Locator;
  readonly errorMessage: Locator;
  readonly successNotification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.valueInput = page.locator('input[type="number"], input[name="value"], .q-input input').first();
    this.submitBtn = page.locator('button[type="submit"], .q-btn').filter({ hasText: /submit|trimite/i }).first();
    this.errorMessage = page.locator('.q-field__messages .text-negative, .text-negative').first();
    this.successNotification = page.locator('.q-notification').filter({ hasText: /success|succes/i });
  }
}
