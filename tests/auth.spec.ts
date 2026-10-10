import { test, expect } from '../fixtures/test-fixtures';
import { LOGIN_ERROR_MESSAGES } from '../types/messages.types';

test('RF-1: login con credenciales válidas redirige a inventory y muestra encabezado de productos', async ({ page, loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory\.html/);
  await inventoryPage.waitForInventoryLoaded();
  await expect(inventoryPage.getHeaderLocator()).toBeVisible();
});

test('RF-2: catálogo muestra al menos un ítem visible y disponible', async ({ page, loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory\.html/);
  await inventoryPage.waitForInventoryLoaded();
  const count = await inventoryPage.getItemsCount();
  expect(count).toBeGreaterThanOrEqual(1);
  const hasAvailable = await inventoryPage.hasAnyAvailableItem();
  expect(hasAvailable).toBe(true);
});

test('RF-3: contraseña errónea muestra mensaje de error', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.loginWithInvalidPassword('standard_user', 'wrong_password');
  const error = loginPage.getErrorMessageLocator();
  await expect(error).toBeVisible();
  await expect(error).toHaveText(LOGIN_ERROR_MESSAGES.invalidCredentials);
  await expect(page).toHaveURL('/');
});

test('RF-5: campos vacíos mantienen login y muestran mensaje de validación', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.loginWithEmptyCredentials();
  const msg = loginPage.getValidationMessageOrErrorLocator();
  await expect(msg).toBeVisible();
  await expect(page).not.toHaveURL(/inventory\.html/);
  await loginPage.isOnLoginPage();
});

test('RF-6: usuario bloqueado muestra mensaje específico', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.loginAsLockedOutUser();
  const error = loginPage.getErrorMessageLocator();
  await expect(error).toBeVisible();
  await expect(error).toHaveText(LOGIN_ERROR_MESSAGES.lockedOutUser);
  await expect(page).toHaveURL('/');
});
