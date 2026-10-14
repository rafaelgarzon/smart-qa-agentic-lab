import { test, expect } from '../fixtures/test-fixtures';
import { TIE_PRICE, expectedNames, expectedPrices, localeCompareEn } from '../types/sort.types';

test.describe('Spec 005: Ordenamiento Algorítmico SauceDemo', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('TC-1 RF-1: el catálogo carga en A-Z idéntico al oráculo léxico y es monótono no decreciente', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    await expect(inventoryPage.sortDropdown).toHaveValue('az');

    const names = await inventoryPage.getItemNames();
    expect(names).toEqual(expectedNames('az'));

    for (let index = 1; index < names.length; index++) {
      expect(localeCompareEn(names[index - 1], names[index])).toBeLessThanOrEqual(0);
    }
  });

  test('TC-2 RF-2: el criterio "Name (Z to A)" es idéntico al oráculo léxico y monótono no creciente', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    await inventoryPage.selectSortAndSettle('za');
    await expect(inventoryPage.sortDropdown).toHaveValue('za');

    const names = await inventoryPage.getItemNames();
    expect(names).toEqual(expectedNames('za'));

    for (let index = 1; index < names.length; index++) {
      expect(localeCompareEn(names[index - 1], names[index])).toBeGreaterThanOrEqual(0);
    }
  });

  test('TC-3 RF-3: el criterio "Price (low to high)" es idéntico al oráculo numérico y monótono no decreciente', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    await inventoryPage.selectSortAndSettle('lohi');
    await expect(inventoryPage.sortDropdown).toHaveValue('lohi');

    const prices = await inventoryPage.getItemPrices();
    expect(prices).toEqual(expectedPrices('lohi'));

    for (let index = 1; index < prices.length; index++) {
      expect(prices[index - 1]).toBeLessThanOrEqual(prices[index]);
    }
  });

  test('TC-4 RF-4: el criterio "Price (high to low)" es idéntico al oráculo numérico y monótono no creciente', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    await inventoryPage.selectSortAndSettle('hilo');
    await expect(inventoryPage.sortDropdown).toHaveValue('hilo');

    const prices = await inventoryPage.getItemPrices();
    expect(prices).toEqual(expectedPrices('hilo'));

    for (let index = 1; index < prices.length; index++) {
      expect(prices[index - 1]).toBeGreaterThanOrEqual(prices[index]);
    }
  });

  test('TC-5 RF-5: los empates de precio ($15.99) se desempatan en orden alfabético ascendente determinista', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    for (const option of ['lohi', 'hilo'] as const) {
      await inventoryPage.selectSortAndSettle('za');
      await inventoryPage.selectSortAndSettle(option);
      await expect(inventoryPage.sortDropdown).toHaveValue(option);

      const names = await inventoryPage.getItemNames();
      const prices = await inventoryPage.getItemPrices();
      const tiedNames = names.filter((_, index) => prices[index] === TIE_PRICE);

      expect(tiedNames).toEqual([
        'Sauce Labs Bolt T-Shirt',
        'Test.allTheThings() T-Shirt (Red)',
      ]);
    }
  });

  test('TC-6 RF-6: el criterio se restablece a "Name (A to Z)" tras reload y navegación cruzada', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    await inventoryPage.selectSortAndSettle('za');
    await inventoryPage.reload();
    await expect(inventoryPage.sortDropdown).toHaveValue('az');
    await expect(inventoryPage.firstItemTitle).toHaveText(expectedNames('az')[0]);

    await inventoryPage.selectSortAndSettle('lohi');
    await inventoryPage.goToCart();
    await cartPage.clickContinueShopping();
    await expect(inventoryPage.sortDropdown).toHaveValue('az');
    await expect(inventoryPage.firstItemTitle).toHaveText(expectedNames('az')[0]);

    await inventoryPage.selectSortAndSettle('hilo');
    await inventoryPage.openProductDetail('Sauce Labs Backpack');
    await inventoryPage.goBackToProducts();
    await expect(inventoryPage.sortDropdown).toHaveValue('az');
    await expect(inventoryPage.firstItemTitle).toHaveText(expectedNames('az')[0]);
  });

  test('TC-7 RF-7: el asentamiento reactivo entrega el primer ítem del criterio sin lectura stale', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    for (const option of ['az', 'za', 'lohi', 'hilo'] as const) {
      await inventoryPage.selectSortAndSettle(option);
      const names = await inventoryPage.getItemNames();
      expect(names[0]).toBe(expectedNames(option)[0]);
    }
  });
});
