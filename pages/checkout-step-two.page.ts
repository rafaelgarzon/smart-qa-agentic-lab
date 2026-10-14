import { Page, Locator, expect } from '@playwright/test';

export class CheckoutStepTwoPage {
  readonly page: Page;
  readonly title: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async verifyStepTwoLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-step-two\.html/);
    await expect(this.title).toHaveText('Checkout: Overview');
  }

  private extractAmount(text: string): number {
    const match = text.match(/\$([0-9]+\.[0-9]{2})/);
    if (!match) throw new Error(`No se pudo parsear el monto en: "${text}"`);
    return parseFloat(match[1]);
  }

  async verifyArithmeticTotals(): Promise<void> {
    await expect(this.subtotalLabel).toBeVisible();
    await expect(this.taxLabel).toBeVisible();
    await expect(this.totalLabel).toBeVisible();

    const subtotalText = await this.subtotalLabel.innerText();
    const taxText = await this.taxLabel.innerText();
    const totalText = await this.totalLabel.innerText();

    const subtotal = this.extractAmount(subtotalText);
    const tax = this.extractAmount(taxText);
    const total = this.extractAmount(totalText);

    const calculatedTotal = Math.round((subtotal + tax) * 100) / 100;
    expect(calculatedTotal).toBe(total);
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }
}
