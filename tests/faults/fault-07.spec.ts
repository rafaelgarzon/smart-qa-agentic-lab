import { test, expect } from '../../fixtures/test-fixtures';

test('RF-7: el estado del carrito se conserva al ordenar y recargar', async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials();
  await inventoryPage.waitForInventoryLoaded();

  const backpackButton = inventoryPage.getItemButtonByName('Sauce Labs Backpack');
  await backpackButton.click();
  await expect(backpackButton).toHaveText(/remove/i);
  await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

  await inventoryPage.selectSort('priceDesc');
  await expect(backpackButton).toHaveText(/remove/i);
  await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

  await inventoryPage.reload();
  await expect(backpackButton).toHaveText(/remove/i);
  await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
});
