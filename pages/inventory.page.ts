import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly inventoryItems: Locator;
  readonly firstItemPrice: Locator;
  readonly firstItemActionButton: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.firstItemPrice = this.inventoryItems.first().locator('[data-test="inventory-item-price"]');
    // Selector agnóstico al estado textual (Add to Cart vs Remove)
    this.firstItemActionButton = this.inventoryItems.first().locator('button.btn_inventory');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  // Retrocompatibilidad con suites existentes
  get firstItemAddToCartButton(): Locator {
    return this.firstItemActionButton;
  }

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
    await expect(this.firstItemActionButton).toBeEnabled();
    return true;
  }

  async addFirstItemToCart(): Promise<void> {
    await this.firstItemActionButton.click();
  }

  async goToCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }
}
