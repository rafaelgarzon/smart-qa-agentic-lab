import { test, expect } from '../../fixtures/test-fixtures';

test('RF-1: el login válido lleva al inventario', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.loginWithValidCredentials();

  await expect(loginPage.page).toHaveURL(/.*inventory\.html/, { timeout: 3000 });
});
