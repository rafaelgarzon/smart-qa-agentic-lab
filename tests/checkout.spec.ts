import { test, expect } from '../fixtures/test-fixtures';
import { CHECKOUT_MESSAGES } from '../types/checkout.types';

test.describe('Spec 002: Flujo Completo de Catálogo, Carrito y Checkout', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
  });

  test('RF-1 & RF-2: Selección de producto, badge reactivo y consistencia en el carrito', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // RF-1: Agregar producto y validar mutación de botón y badge
    await inventoryPage.addFirstItemToCart();
    await expect(inventoryPage.firstItemAddToCartButton).toHaveText(/remove/i);
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    // RF-2: Navegar a carrito y verificar consistencia de vista
    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();
    await expect(cartPage.cartItems).toHaveCount(1);
  });

  test('RF-3: Validación de campos obligatorios en checkout paso uno', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await inventoryPage.addFirstItemToCart();
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    await checkoutStepOnePage.verifyStepOneLoaded();

    // Intento de envío con formulario vacío (bloqueo y mensaje accesible)
    await checkoutStepOnePage.continueCheckout();
    await expect(checkoutStepOnePage.errorMessage).toBeVisible();
    await expect(checkoutStepOnePage.errorMessage).toHaveText(CHECKOUT_MESSAGES.errorFirstNameRequired);
  });

  test('RF-4 & RF-5: Flujo transaccional completo, cálculo aritmético y confirmación de orden', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // Preparar carrito
    await inventoryPage.addFirstItemToCart();
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    // RF-3: Diligenciar información válida del cliente
    await checkoutStepOnePage.fillInformation({
      firstName: 'Rafael',
      lastName: 'Garzón',
      postalCode: '110111',
    });
    await checkoutStepOnePage.continueCheckout();

    // RF-4: Verificar pantalla de resumen y comprobación matemática de totales
    await checkoutStepTwoPage.verifyStepTwoLoaded();
    await checkoutStepTwoPage.verifyArithmeticTotals();

    // RF-5: Finalizar orden y confirmar estado
    await checkoutStepTwoPage.finishOrder();
    await checkoutCompletePage.verifyOrderCompleted();
    await expect(checkoutCompletePage.completeHeader).toHaveText(CHECKOUT_MESSAGES.completeHeader);

    // Retorno limpio al catálogo
    await checkoutCompletePage.backToHome();
    await inventoryPage.waitForInventoryLoaded();
  });
});
