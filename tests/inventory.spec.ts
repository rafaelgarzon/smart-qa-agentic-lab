import { test, expect } from '../fixtures/test-fixtures';
import { EXPECTED_PRODUCT_COUNT, PRICE_PATTERN } from '../types/inventory.types';

test.describe('Spec 003: Inventario SauceDemo', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('TC-1 RF-1: integridad del catálogo — 6 ítems con nombre, descripción, precio y acción habilitada', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    await expect(inventoryPage.inventoryItems).toHaveCount(EXPECTED_PRODUCT_COUNT);

    const names = await inventoryPage.getProductNames();
    const descriptions = await inventoryPage.getProductDescriptions();
    const priceTexts = await inventoryPage.itemPrice.allInnerTexts();
    const buttons = inventoryPage.inventoryItems.locator('button.btn_inventory');

    expect(names).toHaveLength(EXPECTED_PRODUCT_COUNT);
    expect(descriptions).toHaveLength(EXPECTED_PRODUCT_COUNT);
    expect(priceTexts).toHaveLength(EXPECTED_PRODUCT_COUNT);

    names.forEach((name) => expect(name.trim().length).toBeGreaterThan(0));
    descriptions.forEach((description) => expect(description.trim().length).toBeGreaterThan(0));
    priceTexts.forEach((price) => expect(price).toMatch(PRICE_PATTERN));

    await expect(buttons).toHaveCount(EXPECTED_PRODUCT_COUNT);
    for (let index = 0; index < EXPECTED_PRODUCT_COUNT; index++) {
      await expect(buttons.nth(index)).toBeEnabled();
    }
  });
});
