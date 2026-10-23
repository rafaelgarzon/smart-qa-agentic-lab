import { test, expect } from '../../fixtures/test-fixtures';

test('RF-1: el login válido lleva al inventario', async ({
  loginPage,
}) => {
  await loginPage.page.route('**/inventory.html', async (route) => {
    await route.abort('connectionfailed');
  });

  await loginPage.goto();
  await loginPage.loginWithValidCredentials();

  await expect(loginPage.page).toHaveURL(/.*inventory\.html/, { timeout: 3000 });
});
