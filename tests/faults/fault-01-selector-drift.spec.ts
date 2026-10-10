import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Sembrado 01: Falla por selector desfasado', () => {
  test('RF-1 [FAULT]: Debería fallar al buscar botón de login con selector obsoleto', async ({ loginPage }) => {
    await loginPage.goto();
    // Simulación de cambio de UI en producción: el botón ya no tiene el texto esperado
    const staleButton = loginPage.page.getByRole('button', { name: 'Submit Login' });
    await staleButton.click({ timeout: 3000 });
  });
});
