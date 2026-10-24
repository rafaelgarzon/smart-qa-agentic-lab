import { test, expect } from '../../fixtures/test-fixtures';
import { expectedNames, expectedPrices } from '../../types/sort.types';

test('RF-4: Price (high to low) presenta los precios en orden descendente', async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials();
  await inventoryPage.waitForInventoryLoaded();

  await inventoryPage.selectSortAndSettle('za');
  await inventoryPage.selectSortAndSettle('hilo');

  expect(await inventoryPage.getItemPrices()).toEqual(expectedPrices('hilo'));
  expect(await inventoryPage.getItemNames()).toEqual(expectedNames('hilo'));
});
