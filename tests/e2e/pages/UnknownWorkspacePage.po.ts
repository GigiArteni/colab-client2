import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Page Object for UnknownWorkspacePage (/auth/unknown-workspace).
 * Rendered when the tenant lookup returns exists:false or status !== active.
 */
export class UnknownWorkspacePage {
  readonly page: Page;

  readonly container: Locator;
  readonly icon: Locator;
  readonly title: Locator;
  readonly description: Locator;
  readonly ctaButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.locator('.unknown-workspace-page, [role="alert"]').first();
    this.icon = page.locator('.q-icon').first();
    this.title = page.locator('.step-title, h2').first();
    this.description = page.locator('.step-description, p').first();
    this.ctaButton = page.locator('button.portal-btn, .q-btn').first();
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

  async expectCtaButton(): Promise<void> {
    await expect(this.ctaButton).toBeVisible();
  }
}
