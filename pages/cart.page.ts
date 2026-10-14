import { Page, Locator, expect } from '@playwright/test';
import { CartItem, PRICE_PATTERN } from '../types/cart.types';

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly itemQuantity: Locator;
  readonly itemName: Locator;
  readonly itemDescription: Locator;
  readonly itemPrice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.itemQuantity = page.locator('[data-test="item-quantity"]');
    this.itemName = page.locator('[data-test="inventory-item-name"]');
    this.itemDescription = page.locator('[data-test="inventory-item-desc"]');
    this.itemPrice = page.locator('[data-test="inventory-item-price"]');
  }

  async verifyCartLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*cart\.html/);
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.checkoutButton).toBeVisible();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async getItemNames(): Promise<string[]> {
    return await this.itemName.allInnerTexts();
  }

  async getItemDescriptions(): Promise<string[]> {
    return await this.itemDescription.allInnerTexts();
  }

  async getItemPrices(): Promise<number[]> {
    const texts = await this.itemPrice.allInnerTexts();
    return texts.map((text) => this.parsePrice(text));
  }

  async getItemQuantities(): Promise<number[]> {
    const texts = await this.itemQuantity.allInnerTexts();
    return texts.map((text) => this.parseQuantity(text));
  }

  async getItems(): Promise<CartItem[]> {
    const names = await this.getItemNames();
    const descriptions = await this.getItemDescriptions();
    const prices = await this.getItemPrices();
    const quantities = await this.getItemQuantities();
    return names.map((name, index) => ({
      name,
      description: descriptions[index],
      price: prices[index],
      quantity: quantities[index],
    }));
  }

  getItemLocatorByName(name: string): Locator {
    const nameLocator = this.itemName.getByText(name, { exact: true });
    return this.cartItems.filter({ has: nameLocator });
  }

  private parsePrice(text: string): number {
    const match = text.match(PRICE_PATTERN);
    if (!match) throw new Error(`No se pudo parsear el precio en: "${text}"`);
    return parseFloat(match[1]);
  }

  private parseQuantity(text: string): number {
    const quantity = Number.parseInt(text.trim(), 10);
    if (Number.isNaN(quantity)) {
      throw new Error(`No se pudo parsear la cantidad en: "${text}"`);
    }
    return quantity;
  }
}
