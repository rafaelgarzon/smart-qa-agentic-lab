import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Sembrado 02: Discrepancia funcional de negocio', () => {
  test('RF-6 [FAULT]: Debería fallar por mensaje de bloqueo alterado (BUG_PRODUCTO)', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAsLockedOutUser();

    // Accedemos directamente al localizador del mensaje de error del login:
    const errorBanner = loginPage.page.locator('[data-test="error"]');
    
    // Verificamos primero que el banner se renderice correctamente en el DOM:
    await expect(errorBanner).toBeVisible();

    // Simulamos el defecto funcional de producto esperando un texto divergente de contrato:
    await expect(errorBanner).toHaveText(
      'Error interno: La cuenta ha sido suspendida temporalmente por seguridad.',
      { timeout: 3000 }
    );
  });
});
