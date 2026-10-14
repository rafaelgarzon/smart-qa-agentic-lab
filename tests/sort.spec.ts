import { test, expect } from '../fixtures/test-fixtures';
import { expectedNames, expectedPrices, localeCompareEn } from '../types/sort.types';

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
});
