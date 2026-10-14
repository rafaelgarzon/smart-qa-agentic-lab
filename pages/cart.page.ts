import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async verifyCartLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*cart\.html/);
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.checkoutButton).toBeVisible();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
