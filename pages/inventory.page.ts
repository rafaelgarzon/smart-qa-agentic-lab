import { Page, Locator, expect, type Cookie } from '@playwright/test';
import { InventoryProduct, PRICE_PATTERN, SORT_OPTIONS, SortKey } from '../types/inventory.types';
import { SortOption, expectedNames } from '../types/sort.types';
import { ROOT_URL_PATTERN, findSessionCookie } from '../types/session.types';
import { SESSION_MESSAGES } from '../types/messages.types';

export class InventoryPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly inventoryItems: Locator;
  readonly itemName: Locator;
  readonly itemDescription: Locator;
  readonly itemPrice: Locator;
  readonly sortSelect: Locator;
  readonly sortDropdown: Locator;
  readonly firstItemPrice: Locator;
  readonly firstItemTitle: Locator;
  readonly firstItemActionButton: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;
  readonly backToProductsButton: Locator;
  // Header / menú lateral (spec 006)
  readonly burgerButton: Locator;
  readonly menuPanel: Locator;
  readonly logoutLink: Locator;
  readonly inventoryContainer: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headerTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.itemName = page.locator('[data-test="inventory-item-name"]');
    this.itemDescription = page.locator('[data-test="inventory-item-desc"]');
    this.itemPrice = page.locator('[data-test="inventory-item-price"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.firstItemPrice = this.inventoryItems.first().locator('[data-test="inventory-item-price"]');
    this.firstItemTitle = this.inventoryItems.first().locator('[data-test="inventory-item-name"]');
    // Selector agnóstico al estado textual (Add to Cart vs Remove)
    this.firstItemActionButton = this.inventoryItems.first().locator('button.btn_inventory');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    // Header / menú lateral (spec 006). `.bm-menu-wrap` y el marcador de inventario son de
    // último recurso justificados en spec.md §Selectores (nodo de `react-burger-menu` sin
    // `data-test`/rol, respectivamente). El marcador de inventario usa `[data-test]` porque el
    // `id="inventory_container"` está DUPLICADO en el DOM de SauceDemo (el `role="main"` y el grid),
    // lo que provoca violación de strict mode; `[data-test="inventory-container"]` es único (§4).
    this.burgerButton = page.getByRole('button', { name: 'Open Menu' });
    this.menuPanel = page.locator('.bm-menu-wrap');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.inventoryContainer = page.locator('[data-test="inventory-container"]');
    this.errorBanner = page.locator('[data-test="error"]');
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

  /**
   * Selecciona el criterio y espera el asentamiento reactivo del re-render (RF-7).
   * El valor del `<select>` y el primer título del grid se validan contra el oráculo
   * puro del criterio antes de que la prueba capture cualquier dato del DOM.
   */
  async selectSortAndSettle(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
    await expect(this.sortDropdown).toHaveValue(option);
    await expect(this.firstItemTitle).toHaveText(expectedNames(option)[0]);
  }

  async getItemNames(): Promise<string[]> {
    return await this.getProductNames();
  }

  async getItemPrices(): Promise<number[]> {
    return await this.getProductPrices();
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

  /** Abre la vista de detalle de un producto por su nombre (navegación cruzada B, RF-6). */
  async openProductDetail(name: string): Promise<void> {
    await this.getItemLocatorByName(name).locator('[data-test="inventory-item-name"]').click();
    await expect(this.page).toHaveURL(/inventory-item\.html/);
    await expect(this.backToProductsButton).toBeVisible();
  }

  /** Regresa al inventario desde la vista de detalle vía "Back to products" (RF-6). */
  async goBackToProducts(): Promise<void> {
    await this.backToProductsButton.click();
    await expect(this.page).toHaveURL(/inventory\.html/);
    await this.waitForInventoryLoaded();
  }

  // --- Ciclo de sesión / menú lateral (spec 006) ---

  /**
   * Abre el menú lateral y espera su asentamiento reactivo (RF-1/RF-2).
   * Criterio "menú abierto" = conjunción estricta AND: (a) el panel tiene `aria-hidden="false"`
   * y (b) el enlace Logout está plenamente dentro del viewport (`toBeInViewport({ ratio: 1 })`).
   * No se usa `toBeVisible()` del enlace: con el menú cerrado es `isVisible() === true` estando
   * off-screen (falso positivo caracterizado en spec.md). 0 sleeps.
   */
  async openMenuAndSettle(): Promise<void> {
    await this.burgerButton.click();
    await expect(this.menuPanel).toHaveAttribute('aria-hidden', 'false');
    await expect(this.logoutLink).toBeInViewport({ ratio: 1 });
  }

  /** Indica si el panel lateral está en estado abierto (`aria-hidden="false"`). Lectura puntual, 0 sleeps. */
  private async isMenuOpen(): Promise<boolean> {
    return (await this.menuPanel.getAttribute('aria-hidden')) === 'false';
  }

  /**
   * Ejecuta el logout asegurando el menú abierto y espera el asentamiento en la vista de login (RF-3).
   * Idempotente respecto al estado del menú: si ya está abierto (p. ej. tras `openMenuAndSettle()`),
   * no reitera el clic en el burger (que estaría interceptado por el panel). 0 sleeps.
   */
  async logoutAndSettle(): Promise<void> {
    if (!(await this.isMenuOpen())) {
      await this.openMenuAndSettle();
    }
    await this.logoutLink.click();
    await this.expectSettledAtLoginRoot();
  }

  /**
   * Verifica el estado asentado post-logout (no circular): URL raíz Y el contenedor de
   * inventario no visible. Nunca se asevera sobre la URL inmediata de una navegación (RF-3/RF-6).
   */
  async expectSettledAtLoginRoot(): Promise<void> {
    await expect(this.page).toHaveURL(ROOT_URL_PATTERN);
    await expect(this.inventoryContainer).not.toBeVisible();
  }

  /**
   * Verifica el banner del guard de la ruta protegida (RF-5/RF-6): visible y con el texto exacto.
   */
  async expectGuardBanner(): Promise<void> {
    await expect(this.errorBanner).toBeVisible();
    await expect(this.errorBanner).toHaveText(SESSION_MESSAGES.guardedRoute);
  }

  /**
   * Devuelve la cookie de sesión `session-username` desde el contexto del navegador,
   * o `undefined` si está ausente. La sesión es estado del contexto, no un locator del DOM (RF-4).
   */
  async getSessionCookie(): Promise<Cookie | undefined> {
    return findSessionCookie(await this.page.context().cookies());
  }
}
