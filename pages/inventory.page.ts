import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly inventoryItems: Locator;
  readonly firstItemPrice: Locator;
  readonly firstItemAddToCartButton: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.firstItemPrice = this.inventoryItems.first().locator('[data-test="inventory-item-price"]');
    this.firstItemAddToCartButton = this.inventoryItems.first().getByRole('button', { name: /add to cart/i });
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  // Métodos canónicos consumidos por tests/auth.spec.ts (Spec 001)
  getHeaderLocator(): Locator {
    return this.headerTitle;
  }

  async getItemsCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  async waitForInventoryLoaded(): Promise<void> {
    await expect(this.headerTitle).toBeVisible();
    await expect(this.headerTitle).toHaveText('Products');
  }

  async hasAnyAvailableItem(): Promise<boolean> {
    await expect(this.firstItemPrice).toBeVisible();
    await expect(this.firstItemAddToCartButton).toBeEnabled();
    return true;
  }

  // Métodos del flujo de compra (Spec 002)
  async addFirstItemToCart(): Promise<void> {
    await this.firstItemAddToCartButton.click();
  }

  async goToCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }
}
