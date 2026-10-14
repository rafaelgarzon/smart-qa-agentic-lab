import { Page, Locator, expect } from '@playwright/test';
import { CustomerInformation } from '../types/checkout.types';

export class CheckoutStepOnePage {
  readonly page: Page;
  readonly title: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async verifyStepOneLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.*checkout-step-one\.html/);
    await expect(this.title).toHaveText('Checkout: Your Information');
  }

  async fillInformation(info: CustomerInformation): Promise<void> {
    if (info.firstName) await this.firstNameInput.fill(info.firstName);
    if (info.lastName) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode) await this.postalCodeInput.fill(info.postalCode);
  }

  async continueCheckout(): Promise<void> {
    await this.continueButton.click();
  }
}
