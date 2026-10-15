import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from '../fixtures/test-fixtures';
import {
  ANALYTICS_STORAGE_KEYS,
  PROTECTED_PATH,
  SAUCEDEMO_ORIGIN,
  SESSION_COOKIE_NAME,
  SESSION_USER,
} from '../types/session.types';

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

  test('TC-3 RF-3: el logout retorna a la vista de login en estado asentado', async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    await inventoryPage.logoutAndSettle();

    // Estado asentado: URL raíz Y contenedor de inventario no expuesto (no se asevera la URL inmediata).
    await inventoryPage.expectSettledAtLoginRoot();
    await expect(page).toHaveURL(/^https:\/\/www\.saucedemo\.com\/?$/);
  });

  test('TC-4 RF-4: el logout elimina la credencial de sesión session-username', async ({
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    expect(await inventoryPage.getSessionCookie()).toBeDefined();

    await inventoryPage.logoutAndSettle();

    // Lectura sobre el estado del contexto (browserContext.cookies()), no como locator del DOM.
    expect(await inventoryPage.getSessionCookie()).toBeUndefined();
  });

  test('TC-9 RF-9: el logout elimina solo la sesión y conserva la analítica no-auth en localStorage', async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    const storageBefore = await page.evaluate(() => Object.keys(window.localStorage));
    expect(storageBefore).toEqual(expect.arrayContaining([...ANALYTICS_STORAGE_KEYS]));

    await inventoryPage.logoutAndSettle();

    // Sesión eliminada…
    expect(await inventoryPage.getSessionCookie()).toBeUndefined();
    // …pero la analítica no-auth persiste (RF-9: se asevera persistencia, NO limpieza).
    const storageAfter = await page.evaluate(() => Object.keys(window.localStorage));
    for (const key of ANALYTICS_STORAGE_KEYS) {
      expect(storageAfter).toContain(key);
    }
  });

  test('TC-5 RF-5: el guard de /inventory.html deniega cookie ausente, vacía e inválida', async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // Sub-caso 1: cookie ausente.
    await page.context().clearCookies();
    await page.goto(PROTECTED_PATH);
    await inventoryPage.expectSettledAtLoginRoot();
    await inventoryPage.expectGuardBanner();

    // Sub-caso 2: cookie vacía (el guard valida el valor, no solo la presencia).
    // `url` solo: Playwright deriva `path`/`domain` y rechaza `url` + `path` juntos.
    await page.context().addCookies([{ name: SESSION_COOKIE_NAME, value: '', url: SAUCEDEMO_ORIGIN }]);
    await page.goto(PROTECTED_PATH);
    await inventoryPage.expectSettledAtLoginRoot();
    await inventoryPage.expectGuardBanner();

    // Sub-caso 3: cookie con valor no reconocido.
    await page.context().addCookies([
      { name: SESSION_COOKIE_NAME, value: 'usuario_falso', url: SAUCEDEMO_ORIGIN },
    ]);
    await page.goto(PROTECTED_PATH);
    await inventoryPage.expectSettledAtLoginRoot();
    await inventoryPage.expectGuardBanner();
  });

  test('TC-6 RF-6: atrás/adelante tras logout no exponen contenido protegido en estado asentado', async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    await inventoryPage.logoutAndSettle();

    // RF-6: en el estado asentado no se expone contenido protegido. Secuencia acotada y determinista:
    // alternar atrás/adelante interroga la entrada protegida del historial sin agotarlo. Se asevera
    // SOLO el estado asentado (URL raíz + inventario no visible + banner del guard), nunca la URL inmediata.
    for (let i = 0; i < 2; i++) {
      await page.goBack();
      await inventoryPage.expectSettledAtLoginRoot();
      await inventoryPage.expectGuardBanner();

      await page.goForward();
      await inventoryPage.expectSettledAtLoginRoot();
      await inventoryPage.expectGuardBanner();
    }
  });

  test('TC-7 RF-7: el re-login tras logout restaura una sesión válida', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();
    await inventoryPage.logoutAndSettle();

    await loginPage.goto();
    await loginPage.loginWithValidCredentials('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory\.html/);
    expect((await inventoryPage.getSessionCookie())?.value).toBe(SESSION_USER);
  });

  test('TC-8 RF-8: la ráfaga de doble clic en Logout es idempotente y sin errores de página', async ({
    page,
    inventoryPage,
  }) => {
    await inventoryPage.waitForInventoryLoaded();

    // RF-8: se adjunta el observador ANTES de la acción para capturar cualquier `pageerror` de la ráfaga.
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await inventoryPage.openMenuAndSettle();
    await inventoryPage.logoutLink.click({ clickCount: 2 });

    // Idempotencia: estado asentado final en `/` y credencial eliminada; no se cuenta el nº de navegaciones.
    await inventoryPage.expectSettledAtLoginRoot();
    expect(await inventoryPage.getSessionCookie()).toBeUndefined();
    expect(pageErrors).toHaveLength(0);
  });
});

test.describe('006-session-logout-saucedemo — guardarraíles estructurales', () => {
  test('TC-10 RF-10: localización semántica y determinismo verificados sobre el código fuente', async () => {
    const pom = readFileSync(resolve(__dirname, '..', 'pages', 'inventory.page.ts'), 'utf8');
    const suite = readFileSync(resolve(__dirname, 'logout.spec.ts'), 'utf8');

    // Localización semántica (RF-10): burger por rol; logout e inventario por atributo de contrato `data-test`.
    expect(pom).toMatch(/burgerButton\s*=\s*page\.getByRole\('button', \{ name: 'Open Menu' \}\)/);
    expect(pom).toMatch(/logoutLink\s*=\s*page\.locator\('\[data-test="logout-sidebar-link"\]'\)/);
    expect(pom).toMatch(
      /inventoryContainer\s*=\s*page\.locator\('\[data-test="inventory-container"\]'\)/,
    );
    // No se usa el `id` duplicado (`#inventory_container`) para esos tres controles.
    expect(pom).not.toContain('#inventory_container');
    // El único CSS estructural admitido es `.bm-menu-wrap`, con justificación §4 documentada.
    expect(pom).toContain('.bm-menu-wrap');
    expect(pom).toContain('§4');

    // Determinismo (§3 / RF-10): la suite no contiene pausas estáticas.
    // Los needles se construyen por concatenación para no auto-referenciarse en este mismo archivo.
    const bannedTimer = 'waitFor' + 'Timeout';
    expect(suite).not.toContain(bannedTimer);
    const bannedPause = new RegExp(`\\b${'sle' + 'ep'}\\b`);
    expect(suite).not.toMatch(bannedPause);
  });
});
