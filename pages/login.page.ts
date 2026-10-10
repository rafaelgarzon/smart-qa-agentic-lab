import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para la vista de login de SauceDemo.
 * Cumple con los contratos semánticos de plan.md y spec.md (RF-1 a RF-6).
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessageContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessageContainer = page.locator('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async loginWithValidCredentials(username = 'standard_user', password = 'secret_sauce'): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithInvalidPassword(username = 'standard_user', password = 'wrong_password'): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithEmptyCredentials(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
    await this.loginButton.click();
  }

  async loginAsLockedOutUser(): Promise<void> {
    await this.usernameInput.fill('locked_out_user');
    await this.passwordInput.fill('secret_sauce');
    await this.loginButton.click();
  }

  getErrorMessage(): Locator {
    return this.errorMessageContainer;
  }

  // Alias para mantener compatibilidad con el spec
  getErrorMessageLocator(): Locator {
    return this.errorMessageContainer;
  }

  getValidationMessageOrErrorLocator(): Locator {
    return this.errorMessageContainer;
  }

  async isOnLoginPage(): Promise<boolean> {
    return this.loginButton.isVisible();
  }
}
