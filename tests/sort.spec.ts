import { test, expect } from '../fixtures/test-fixtures';
import { expectedNames, localeCompareEn } from '../types/sort.types';

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
});
