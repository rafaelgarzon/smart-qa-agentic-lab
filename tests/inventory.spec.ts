import { test, expect } from '../fixtures/test-fixtures';
import { EXPECTED_PRODUCT_COUNT, PRICE_PATTERN, SORT_OPTIONS } from '../types/inventory.types';

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

  test('TC-2 RF-2: el catálogo carga por defecto en orden alfabético ascendente "Name (A to Z)"', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    await expect(inventoryPage.sortSelect).toHaveValue(SORT_OPTIONS.nameAsc);

    const names = await inventoryPage.getProductNames();
    expect(names).toEqual([...names].sort());
  });

  test('TC-3 RF-3: el criterio "Name (Z to A)" reordena los 6 ítems alfabéticamente descendente', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    const ascending = await inventoryPage.getProductNames();

    await inventoryPage.selectSort('nameDesc');
    await expect(inventoryPage.inventoryItems).toHaveCount(EXPECTED_PRODUCT_COUNT);

    const names = await inventoryPage.getProductNames();
    expect(names).toEqual([...ascending].sort().reverse());
  });

  test('TC-4 RF-4: el criterio "Price (low to high)" reordena por precio numérico ascendente', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    await inventoryPage.selectSort('priceAsc');
    await expect(inventoryPage.sortSelect).toHaveValue(SORT_OPTIONS.priceAsc);

    const prices = await inventoryPage.getProductPrices();
    expect(prices).toHaveLength(EXPECTED_PRODUCT_COUNT);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('TC-5 RF-5: el criterio "Price (high to low)" reordena por precio numérico descendente', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    await inventoryPage.selectSort('priceDesc');
    await expect(inventoryPage.sortSelect).toHaveValue(SORT_OPTIONS.priceDesc);

    const prices = await inventoryPage.getProductPrices();
    expect(prices).toHaveLength(EXPECTED_PRODUCT_COUNT);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('TC-6 RF-6: ordenamiento numérico determinista y estable ante empates de precio', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    await inventoryPage.selectSort('priceAsc');
    const firstPass = await inventoryPage.getProducts();

    await inventoryPage.selectSort('priceDesc');
    await inventoryPage.selectSort('priceAsc');
    const secondPass = await inventoryPage.getProducts();

    const priceCounts = new Map<number, number>();
    firstPass.forEach((product) => priceCounts.set(product.price, (priceCounts.get(product.price) ?? 0) + 1));
    const tiedPrices = [...priceCounts.values()].filter((count) => count > 1);
    expect(tiedPrices.length).toBeGreaterThan(0);

    expect(secondPass.map((product) => product.name)).toEqual(firstPass.map((product) => product.name));
    expect(secondPass.map((product) => product.price)).toEqual(firstPass.map((product) => product.price));
  });
});
