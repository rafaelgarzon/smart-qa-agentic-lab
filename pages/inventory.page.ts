import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object para la vista de inventario/catálogo de SauceDemo.
 * Cumple con los contratos exigidos por tests/auth.spec.ts y RF-1 / RF-2.
 */
export class InventoryPage {
  readonly page: Page;
  readonly headerTitle: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    this.page = page;
    // En SauceDemo el título del catálogo es identificable por data-test="title"
    this.headerTitle = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
  }

  /**
   * Valida la sincronización determinista de carga sin esperas estáticas.
   */
  async waitForInventoryLoaded(): Promise<void> {
    await expect(this.headerTitle).toBeVisible();
    await expect(this.inventoryItems.first()).toBeVisible();
  }

  /**
   * Retorna el Locator del encabezado para aserciones web directas (RF-1).
   */
  getHeaderLocator(): Locator {
    return this.headerTitle;
  }

  /**
   * Retorna el total de ítems en el catálogo (RF-2).
   */
  async getItemsCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  /**
   * Verifica la presencia de al menos un ítem interactivo disponible (RF-2).
   */
  async hasAnyAvailableItem(): Promise<boolean> {
    const count = await this.inventoryItems.count();
    return count > 0;
  }
}
