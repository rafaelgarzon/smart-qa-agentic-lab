# Tasks: Spec 006 — Cierre de Sesión (Logout) y Postcondiciones de Sesión en SauceDemo

Plan base: `specs/006-session-logout-saucedemo/plan.md`
Spec base: `specs/006-session-logout-saucedemo/spec.md` (Estado: aprobada)
Convención: una tarea por sesión de implementación (máx. 20-30 min), tests primero.
Granularidad: **10 tareas atómicas secuenciales** (≤10), mapeo 1:1 RF↔TC conservado en la Fase 2.

---

## Fase 1 — Tipos y extensión POM

- [x] **T1. Crear `types/session.types.ts` y ampliar `types/messages.types.ts`** RF-1..RF-10
  Definir contratos/constantes **sin DOM**: `SAUCEDEMO_ORIGIN`, `SAUCEDEMO_DOMAIN`, `SESSION_COOKIE_NAME='session-username'`, `SESSION_USER='standard_user'`, `PROTECTED_PATH='/inventory.html'`, `ROOT_URL_PATTERN=/^https:\/\/www\.saucedemo\.com\/?$/`, `ANALYTICS_STORAGE_KEYS=['backtrace-guid','backtrace-last-active']` y los helpers puros `findSessionCookie(cookies)` / `hasSessionCookie(cookies)`. Añadir de forma **aditiva** `SESSION_MESSAGES = { guardedRoute: "Epic sadface: You can only access '/inventory.html' when you are logged in." }` en `types/messages.types.ts` (conservar `LOGIN_ERROR_MESSAGES` intacto).
  Hecho cuando: `npx tsc --noEmit` compila sin `any` y `findSessionCookie([])` devuelve `undefined`.

- [ ] **T2. Extender `pages/inventory.page.ts` (aditivo) con menú/logout y métodos reactivos** RF-1, RF-2, RF-3, RF-6, RF-10
  Añadir locators: `burgerButton = page.getByRole('button', { name: 'Open Menu' })`, `logoutLink = page.locator('[data-test="logout-sidebar-link"]')`, `menuPanel = page.locator('.bm-menu-wrap')` **(CSS §4 justificado)**, `inventoryContainer = page.locator('#inventory_container')` **(CSS §4 justificado)**, `errorBanner = page.locator('[data-test="error"]')`. Métodos: `openMenuAndSettle()` (clic burger → `expect(menuPanel).toHaveAttribute('aria-hidden','false')` **y** `expect(logoutLink).toBeInViewport({ ratio: 1 })`), `logoutAndSettle()` (clic `logoutLink` → `expectSettledAtLoginRoot()`), `expectSettledAtLoginRoot()` (`toHaveURL(ROOT_URL_PATTERN)` **y** `inventoryContainer` no visible), `expectGuardBanner()` (`errorBanner` con `SESSION_MESSAGES.guardedRoute`) y `getSessionCookie()` (lee `page.context().cookies()` + `findSessionCookie`). **NO** tocar `playwright.config.ts`. Conservar intactos todos los locators/métodos actuales (001–005).
  Hecho cuando: `npm run test:all` sigue en verde para 001–005 y `npx tsc --noEmit` compila sin errores.

## Fase 2 — Pruebas E2E (mapeo incremental TC-1..TC-10)

- [ ] **T3. TC-1 + TC-2 — RF-1 y RF-2: apertura del menú y criterio "menú abierto"** RF-1, RF-2
  En `tests/logout.spec.ts` (con `beforeEach` de login por UI): TC-1 invoca `openMenuAndSettle()` y confirma el panel abierto y el `logoutLink` actionable. TC-2 valida la **discriminación** del criterio: con el menú cerrado `logoutLink.isVisible() === true` pero `toBeInViewport({ ratio: 1 })` es falso; tras `openMenuAndSettle()` el AND es verdadero. Sin sleeps.
  Hecho cuando: ambos tests pasan en Chromium y TC-2 falla si se sustituye por `toBeVisible()`.

- [ ] **T4. TC-3 + TC-4 + TC-9 — RF-3, RF-4 y RF-9: retorno, cookie y non-goal de storage** RF-3, RF-4, RF-9
  TC-3: `logoutAndSettle()` y `expectSettledAtLoginRoot()`. TC-4: tras el logout, `getSessionCookie()` es `undefined` (lectura de `page.context().cookies()`). TC-9: tras el logout, `session-username` ausente **y** `localStorage` **conserva** `ANALYTICS_STORAGE_KEYS` (asevera persistencia, **no** limpieza).
  Hecho cuando: los tres tests pasan en Chromium; TC-4 falla si la cookie sobrevive y TC-9 falla si se borra la analítica.

- [ ] **T5. TC-5 — RF-5: guard de `/inventory.html` por navegación directa (3 sub-casos)** RF-5
  Sub-casos deterministas: cookie **ausente** (`clearCookies()`), **vacía** (`addCookies([{ name: SESSION_COOKIE_NAME, value: '', url: SAUCEDEMO_ORIGIN, path: '/' }])`) e **inválida** (`value: 'usuario_falso'`); en cada uno `page.goto(PROTECTED_PATH)`, luego `expectSettledAtLoginRoot()` **y** `expectGuardBanner()`.
  Hecho cuando: los tres sub-casos redirigen a `/` con el banner visible y el test falla si el guard no valida el valor.

- [ ] **T6. TC-6 — RF-6: atrás/adelante bloqueados sobre estado asentado** RF-6
  Tras `logoutAndSettle()`, ejecutar `page.goBack()` y `page.goForward()` (una y varias veces); en cada paso aseverar el **estado asentado** (`expectSettledAtLoginRoot()` + `expectGuardBanner()`), nunca la URL inmediata. No se exige ausencia de flash.
  Hecho cuando: todas las navegaciones concluyen desautenticadas y el test pasa de forma repetible (sin flakiness).

- [ ] **T7. TC-7 — RF-7: re-login determinista restaura la sesión** RF-7
  Tras `logoutAndSettle()`, ejecutar `loginPage.goto()` + `loginPage.loginWithValidCredentials('standard_user','secret_sauce')`; aseverar `expect(page).toHaveURL(/inventory\.html/)` **y** `expect((await getSessionCookie())?.value).toBe(SESSION_USER)`.
  Hecho cuando: el test pasa en Chromium con `standard_user`.

- [ ] **T8. TC-8 — RF-8: idempotencia de la ráfaga de clic** RF-8
  Adjuntar `page.on('pageerror', e => pageErrors.push(e))` **antes** de la acción; con el menú asentado ejecutar `logoutLink.click({ clickCount: 2 })`; aseverar estado asentado en `/` (`expectSettledAtLoginRoot()`), `getSessionCookie()` ausente y `expect(pageErrors).toHaveLength(0)`. No se cuenta el número de navegaciones.
  Hecho cuando: el test pasa en Chromium y falla si la ráfaga produce un `pageerror` o no elimina la cookie.

- [ ] **T9. TC-10 — RF-10: guardarraíles de localización y determinismo** RF-10
  Verificar estructuralmente que el POM localiza el burger por **rol** y el logout por `data-test` (sin CSS para esos dos), y que `tests/logout.spec.ts` no contiene `waitForTimeout`/`sleep`. Los CSS `.bm-menu-wrap` / `#inventory_container` solo aparecen con la justificación §4.
  Hecho cuando: el test estructural pasa y `npm run lint:determinism` reporta 0 sleeps.

## Fase 3 — Quality Gate transversal

- [ ] **T10. Quality Gate: tipos, determinismo (todo el árbol) y regresión global** RF-1..RF-10
  Ampliar el script `lint:determinism` de `package.json` para cubrir **todo el árbol del arnés** (`pages/`, `tests/`, `fixtures/`, `types/`, `reporters/`, helpers) **incluyendo archivos no rastreados** (p. ej. `git grep --untracked`). Ejecutar `npx tsc --noEmit` (sin errores), `npm run lint:determinism` (0 sleeps) y `npm run test:all` (Chromium, suites 001–006 en verde, incluyendo `tests/logout.spec.ts` con 10 TC). Confirmar la matriz de trazabilidad RF → TC y la ausencia de solapamiento con 001–005.
  Hecho cuando: `tsc --noEmit` limpio, `lint:determinism` limpio (todo el árbol) y `test:all` en verde con la matriz RF→TC confirmada.
