import { test, expect } from '../../fixtures/test-fixtures';

test('RF-4: al eliminar el último ítem el carrito queda vacío', async ({ loginPage, inventoryPage, cartPage }) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials();
  await inventoryPage.waitForInventoryLoaded();

  await inventoryPage.getItemButtonByName('Sauce Labs Backpack').click();
  await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

  await inventoryPage.goToCart();
  await cartPage.verifyCartLoaded();
  await expect(cartPage.shoppingCartBadge).toHaveText('1');

  await cartPage.removeItemByName('Sauce Labs Backpack');
  await expect(cartPage.cartItems).toHaveCount(0);
  await expect(cartPage.shoppingCartBadge).toHaveText('0');
});
