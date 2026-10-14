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
});
