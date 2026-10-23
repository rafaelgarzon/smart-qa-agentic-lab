import { test, expect } from '../../fixtures/test-fixtures';

test('RF-6: el usuario bloqueado ve el mensaje de bloqueo', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.loginAsLockedOutUser();

  const errorBanner = loginPage.page.locator('[data-test="error"]');

  await expect(errorBanner).toBeVisible();

  await expect(errorBanner).toHaveText(
    'Error interno: La cuenta ha sido suspendida temporalmente por seguridad.',
    { timeout: 3000 }
  );
});
