import { test, expect } from '../../fixtures/test-fixtures';

test('RF-4: el total final es igual a la suma del subtotal y el impuesto', async ({
  loginPage,
  inventoryPage,
  cartPage,
  checkoutStepOnePage,
  checkoutStepTwoPage,
}) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials();
  await inventoryPage.waitForInventoryLoaded();

  await inventoryPage.addFirstItemToCart();
  await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
  await inventoryPage.goToCart();
  await cartPage.verifyCartLoaded();
  await cartPage.proceedToCheckout();

  await checkoutStepOnePage.verifyStepOneLoaded();
  await checkoutStepOnePage.fillInformation({ firstName: 'Ada', lastName: 'Lovelace', postalCode: '10001' });
  await checkoutStepOnePage.continueCheckout();

  await checkoutStepTwoPage.verifyStepTwoLoaded();
  await checkoutStepTwoPage.verifyArithmeticTotals();
});
