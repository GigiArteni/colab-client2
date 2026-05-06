import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Page Object for NoWorkspaceLandingPage (/auth/no-workspace).
 * Rendered when visiting the apex domain (no tenant subdomain).
 */
export class NoWorkspaceLandingPage {
  readonly page: Page;

  readonly container: Locator;
  readonly icon: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly example: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.locator('.no-workspace-page').first();
    this.icon = page.locator('.q-icon').first();
    this.title = page.locator('.step-title, h2').first();
    this.description = page.locator('.step-description, p').first();
    this.example = page.locator('.step-example, code').first();
  }

  async waitForVisible(): Promise<void> {
    await expect(this.container).toBeVisible({ timeout: 8000 });
  }

  async expectTitle(text: string | RegExp): Promise<void> {
    await expect(this.title).toContainText(text);
  }

  async expectDescription(text: string | RegExp): Promise<void> {
    await expect(this.description).toContainText(text);
  }

  async expectExampleUrl(): Promise<void> {
    await expect(this.example).toBeVisible();
    await expect(this.example).toContainText(/colab-client\.app|furnizorultau/i);
  }
}
