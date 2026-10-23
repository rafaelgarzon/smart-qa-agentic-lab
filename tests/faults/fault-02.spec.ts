import { test, expect } from '../../fixtures/test-fixtures';
import { LOGIN_ERROR_MESSAGES } from '../../types/messages.types';

test('RF-6: el usuario bloqueado ve el mensaje de bloqueo', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.loginAsLockedOutUser();

  await expect(loginPage.getErrorMessage()).toHaveText(LOGIN_ERROR_MESSAGES.lockedOutUser);
});
