import { test, expect } from '../../fixtures/test-fixtures';

test('RF-5: Continue Shopping vuelve al inventario conservando el badge', async ({
  loginPage,
  inventoryPage,
  cartPage,
}) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials();
  await inventoryPage.waitForInventoryLoaded();

  await inventoryPage.getItemButtonByName('Sauce Labs Backpack').click();
  await inventoryPage.getItemButtonByName('Sauce Labs Bike Light').click();
  await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

  await inventoryPage.goToCart();
  await cartPage.verifyCartLoaded();
  await cartPage.removeItemByName('Sauce Labs Bike Light');
  await expect(cartPage.shoppingCartBadge).toHaveText('1');

  await cartPage.clickContinueShopping();
  await inventoryPage.waitForInventoryLoaded();
  await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
});
