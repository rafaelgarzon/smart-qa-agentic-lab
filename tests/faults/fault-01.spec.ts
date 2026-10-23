import { test, expect } from '../../fixtures/test-fixtures';

test('RF-1: el usuario confirma el formulario de login', async ({ loginPage }) => {
  await loginPage.goto();
  const submitButton = loginPage.page.getByRole('button', { name: 'Submit Login' });
  await submitButton.click({ timeout: 3000 });
});
