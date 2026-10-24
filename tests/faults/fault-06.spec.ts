import { test, expect } from '../../fixtures/test-fixtures';

test('RF-9: el logout elimina únicamente la credencial de sesión', async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials();
  await inventoryPage.waitForInventoryLoaded();
  expect(await inventoryPage.getSessionCookie()).toBeDefined();

  await inventoryPage.logoutAndSettle();

  expect(await inventoryPage.getSessionCookie()).toBeUndefined();
  const storageKeys = await inventoryPage.page.evaluate(() => Object.keys(window.localStorage));
  expect(storageKeys).toEqual([]);
});
