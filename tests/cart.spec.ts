import { test, expect } from '../fixtures/test-fixtures';
import { CART_QUANTITY, PRICE_PATTERN } from '../types/cart.types';

test.describe('Spec 004: Gestión del Carrito SauceDemo', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('TC-1 RF-1: integridad de ítems del carrito — nombre no vacío, descripción, precio $XX.YY y Remove habilitado', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // Precondición: se añaden ≥2 ítems por UI para certificar la integridad global.
    const selectedNames = (await inventoryPage.getProductNames()).slice(0, 2);
    for (const name of selectedNames) {
      await inventoryPage.getItemButtonByName(name).click();
    }

    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();
    await expect(cartPage.cartItems).toHaveCount(selectedNames.length);

    const names = await cartPage.getItemNames();
    const descriptions = await cartPage.getItemDescriptions();
    const priceTexts = await cartPage.itemPrice.allInnerTexts();

    expect(names).toHaveLength(selectedNames.length);
    expect(descriptions).toHaveLength(selectedNames.length);
    expect(priceTexts).toHaveLength(selectedNames.length);

    names.forEach((name) => expect(name.trim().length).toBeGreaterThan(0));
    descriptions.forEach((description) => expect(description.trim().length).toBeGreaterThan(0));
    priceTexts.forEach((price) => expect(price).toMatch(PRICE_PATTERN));

    const removeButtons = cartPage.cartItems.getByRole('button', { name: /remove/i });
    await expect(removeButtons).toHaveCount(selectedNames.length);
    for (let index = 0; index < selectedNames.length; index++) {
      await expect(cartPage.cartItems.nth(index)).toBeVisible();
      await expect(removeButtons.nth(index)).toBeEnabled();
    }
  });

  test('TC-2 RF-2: cantidad invariante QTY=1 en cada ítem del carrito', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    const selectedNames = (await inventoryPage.getProductNames()).slice(0, 2);
    for (const name of selectedNames) {
      await inventoryPage.getItemButtonByName(name).click();
    }

    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();

    const quantityLocators = cartPage.cartItems.locator('[data-test="item-quantity"]');
    await expect(quantityLocators).toHaveCount(selectedNames.length);
    for (let index = 0; index < selectedNames.length; index++) {
      await expect(quantityLocators.nth(index)).toHaveText(String(CART_QUANTITY));
    }

    const quantities = await cartPage.getItemQuantities();
    expect(quantities).toEqual(Array(selectedNames.length).fill(CART_QUANTITY));
  });

  test('TC-3 RF-3: Remove excluye el ítem y decrementa el badge exactamente en una unidad', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    const selectedNames = (await inventoryPage.getProductNames()).slice(0, 2);
    for (const name of selectedNames) {
      await inventoryPage.getItemButtonByName(name).click();
    }

    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();
    await expect(cartPage.cartItems).toHaveCount(selectedNames.length);
    await expect(cartPage.shoppingCartBadge).toHaveText(String(selectedNames.length));

    const [removedName] = selectedNames;
    await cartPage.removeItemByName(removedName);

    await expect(cartPage.cartItems).toHaveCount(selectedNames.length - 1);
    await expect(cartPage.shoppingCartBadge).toHaveText(String(selectedNames.length - 1));

    const remainingNames = await cartPage.getItemNames();
    expect(remainingNames).not.toContain(removedName);
  });

  test('TC-8 RF-8: eliminación múltiple secuencial mantiene el badge sincronizado 3→2→1', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    const selectedNames = (await inventoryPage.getProductNames()).slice(0, 3);
    for (const name of selectedNames) {
      await inventoryPage.getItemButtonByName(name).click();
    }

    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();
    await expect(cartPage.cartItems).toHaveCount(selectedNames.length);
    await expect(cartPage.shoppingCartBadge).toHaveText(String(selectedNames.length));

    let expectedCount = selectedNames.length;
    for (const name of selectedNames) {
      await cartPage.removeItemByName(name);
      expectedCount -= 1;

      await expect(cartPage.cartItems).toHaveCount(expectedCount);
      if (expectedCount > 0) {
        await expect(cartPage.shoppingCartBadge).toHaveText(String(expectedCount));
      } else {
        await expect(cartPage.shoppingCartBadge).toHaveCount(0);
      }
    }
  });

  test('TC-4 RF-4: el vaciamiento total deja la lista sin ítems y oculta por completo el badge', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // Precondición: se añaden ≥2 ítems para certificar el vaciamiento ítem por ítem.
    const selectedNames = (await inventoryPage.getProductNames()).slice(0, 2);
    for (const name of selectedNames) {
      await inventoryPage.getItemButtonByName(name).click();
    }

    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();
    await expect(cartPage.cartItems).toHaveCount(selectedNames.length);
    await expect(cartPage.shoppingCartBadge).toHaveText(String(selectedNames.length));

    // Se elimina cada ítem hasta vaciar el carrito por completo.
    for (const name of selectedNames) {
      await cartPage.removeItemByName(name);
    }

    await cartPage.verifyEmptyCart();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.shoppingCartBadge).toHaveCount(0);
  });

  test('TC-7 RF-7: el acceso directo a /cart.html con carrito vacío presenta un estado válido sin errores', async ({
    page,
    cartPage,
  }) => {
    // Deep-link tras autenticar en beforeEach, sin añadir ítems previamente.
    await page.goto('/cart.html');
    await cartPage.verifyCartLoaded();
    await cartPage.verifyEmptyCart();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.shoppingCartBadge).toHaveCount(0);
  });

  test('TC-5 RF-5: Continue Shopping regresa a /inventory.html preservando el badge con los ítems restantes', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // Precondición: 2 ítems para remover uno y conservar el otro con el badge intacto.
    const selectedNames = (await inventoryPage.getProductNames()).slice(0, 2);
    for (const name of selectedNames) {
      await inventoryPage.getItemButtonByName(name).click();
    }

    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();
    await expect(cartPage.cartItems).toHaveCount(selectedNames.length);
    await expect(cartPage.shoppingCartBadge).toHaveText(String(selectedNames.length));

    // Se elimina un único ítem: permanece exactamente uno en el carrito.
    const [removedName] = selectedNames;
    await cartPage.removeItemByName(removedName);
    await expect(cartPage.cartItems).toHaveCount(selectedNames.length - 1);
    await expect(cartPage.shoppingCartBadge).toHaveText('1');

    await cartPage.clickContinueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(cartPage.shoppingCartBadge).toHaveText('1');
  });

  test('TC-9 RF-9: tras eliminar un ítem del carrito, el inventario restaura la acción "Add to cart" y oculta el badge', async ({
    page,
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    const [targetName] = await inventoryPage.getProductNames();
    await inventoryPage.getItemButtonByName(targetName).click();
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();
    await cartPage.removeItemByName(targetName);
    await cartPage.verifyEmptyCart();

    await cartPage.clickContinueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
    await inventoryPage.waitForInventoryLoaded();

    // El producto eliminado vuelve a exponer su acción inicial y el badge ya no existe.
    await expect(inventoryPage.getItemButtonByName(targetName)).toHaveText(/add to cart/i);
    await expect(inventoryPage.shoppingCartBadge).toHaveCount(0);
  });

  test('TC-6 RF-6: la recarga del carrito conserva exactamente los ítems restantes, mantiene el badge y no resucita el ítem removido', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // Precondición: 2 ítems para remover uno y verificar la persistencia del que permanece.
    const selectedNames = (await inventoryPage.getProductNames()).slice(0, 2);
    for (const name of selectedNames) {
      await inventoryPage.getItemButtonByName(name).click();
    }

    await inventoryPage.goToCart();
    await cartPage.verifyCartLoaded();
    await expect(cartPage.cartItems).toHaveCount(selectedNames.length);
    await expect(cartPage.shoppingCartBadge).toHaveText(String(selectedNames.length));

    // Se elimina un único ítem antes de recargar; el restante queda en el carrito.
    const [removedName, remainingName] = selectedNames;
    await cartPage.removeItemByName(removedName);
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.shoppingCartBadge).toHaveText('1');

    // Recarga forzada de la vista del carrito.
    await cartPage.reload();

    // El ítem restante persiste intacto y el badge se mantiene estable.
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.shoppingCartBadge).toHaveText('1');

    const remainingNames = await cartPage.getItemNames();
    expect(remainingNames).toHaveLength(1);
    expect(remainingNames).toContain(remainingName);

    // El ítem removido no reaparece ni en la lista ni mediante su locator directo.
    expect(remainingNames).not.toContain(removedName);
    await expect(cartPage.getItemLocatorByName(removedName)).toHaveCount(0);
  });
});
