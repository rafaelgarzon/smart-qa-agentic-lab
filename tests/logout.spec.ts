import { test, expect } from '../fixtures/test-fixtures';

test.describe('006-session-logout-saucedemo', () => {
  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithValidCredentials('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('TC-1 RF-1/RF-2: flujo canónico de logout — apertura del menú y asentamiento en login', async ({
    loginPage,
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // RF-1/RF-2: la apertura deja el panel activo y el control Logout accionable (conjunción AND).
    await inventoryPage.openMenuAndSettle();
    await expect(inventoryPage.menuPanel).toHaveAttribute('aria-hidden', 'false');
    await expect(inventoryPage.logoutLink).toBeInViewport({ ratio: 1 });

    // Flujo canónico: logout y asentamiento en la vista de login.
    await inventoryPage.logoutAndSettle();
    await inventoryPage.expectSettledAtLoginRoot();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('TC-2 RF-2: el criterio "menú abierto" discrimina el falso positivo off-screen del enlace Logout', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // Menú cerrado: el enlace es `isVisible() === true` pero está off-screen (falso positivo).
    await expect(inventoryPage.burgerButton).toBeVisible();
    await expect(inventoryPage.menuPanel).toHaveAttribute('aria-hidden', 'true');
    expect(await inventoryPage.logoutLink.isVisible()).toBe(true);
    await expect(inventoryPage.logoutLink).not.toBeInViewport({ ratio: 1 });

    // Menú abierto: la conjunción estricta AND se cumple (no-circular).
    await inventoryPage.openMenuAndSettle();
    await expect(inventoryPage.menuPanel).toHaveAttribute('aria-hidden', 'false');
    await expect(inventoryPage.logoutLink).toBeInViewport({ ratio: 1 });
  });
});
