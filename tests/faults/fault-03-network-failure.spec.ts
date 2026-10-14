import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Sembrado 03: Fallo de Infraestructura y Red', () => {
  test('RF-1 [FAULT]: Debería fallar por degradación de backend/red al autenticar (DATOS_O_ENTORNO)', async ({
    loginPage,
  }) => {
    // Interceptamos la navegación para simular una caída de infraestructura o bloqueo de red
    await loginPage.page.route('**/inventory.html', async (route) => {
      await route.abort('connectionfailed');
    });

    await loginPage.goto();
    await loginPage.loginWithValidCredentials();

    // La aserción espera llegar al inventario, pero la red falló a nivel de transporte:
    await expect(loginPage.page).toHaveURL(/.*inventory\.html/, { timeout: 3000 });
  });
});
