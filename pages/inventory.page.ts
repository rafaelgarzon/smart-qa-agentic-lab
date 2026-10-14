import { Page, Locator, expect } from '@playwright/test';
import { InventoryProduct, PRICE_PATTERN, SORT_OPTIONS, SortKey } from '../types/inventory.types';

export class InventoryPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly inventoryItems: Locator;
  readonly itemName: Locator;
  readonly itemDescription: Locator;
  readonly itemPrice: Locator;
  readonly sortSelect: Locator;
  readonly firstItemPrice: Locator;
  readonly firstItemActionButton: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.itemName = page.locator('[data-test="inventory-item-name"]');
    this.itemDescription = page.locator('[data-test="inventory-item-desc"]');
    this.itemPrice = page.locator('[data-test="inventory-item-price"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
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

  async getProductNames(): Promise<string[]> {
    return await this.itemName.allInnerTexts();
  }

  async getProductDescriptions(): Promise<string[]> {
    return await this.itemDescription.allInnerTexts();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.itemPrice.allInnerTexts();
    return texts.map((text) => this.parsePrice(text));
  }

  async getProducts(): Promise<InventoryProduct[]> {
    const names = await this.getProductNames();
    const descriptions = await this.getProductDescriptions();
    const prices = await this.getProductPrices();
    return names.map((name, index) => ({
      name,
      description: descriptions[index],
      price: prices[index],
    }));
  }

  private parsePrice(text: string): number {
    const match = text.match(PRICE_PATTERN);
    if (!match) throw new Error(`No se pudo parsear el precio en: "${text}"`);
    return parseFloat(match[1]);
  }

  async selectSort(option: SortKey): Promise<void> {
    await this.sortSelect.selectOption(SORT_OPTIONS[option]);
    await expect(this.sortSelect).toHaveValue(SORT_OPTIONS[option]);
  }

  getItemLocatorByName(name: string): Locator {
    const nameLocator = this.page.locator('[data-test="inventory-item-name"]').getByText(name, { exact: true });
    return this.inventoryItems.filter({ has: nameLocator });
  }

  getItemButtonByName(name: string): Locator {
    return this.getItemLocatorByName(name).locator('button.btn_inventory');
  }

  async getCartBadgeText(): Promise<string> {
    await expect(this.shoppingCartBadge).toBeVisible();
    return await this.shoppingCartBadge.innerText();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForInventoryLoaded();
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
