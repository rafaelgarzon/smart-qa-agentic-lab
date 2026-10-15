# Plan Técnico: Spec 006 — Cierre de Sesión (Logout) y Postcondiciones de Sesión en SauceDemo

**Especificación base:** `specs/006-session-logout-saucedemo/spec.md` (Estado: aprobada)
**Fecha:** 2026-10-14
**Idioma:** Español
**Equipo/Role:** Test Automation Lead Architect

---

## 1. Objetivo del Plan

Diseñar la arquitectura técnica para auditar el **ciclo de terminación de sesión** (RF-1 a RF-10): apertura determinista del menú lateral con asentamiento reactivo, logout con retorno a la raíz, eliminación de la credencial `session-username`, bloqueo de la ruta protegida `/inventory.html` (navegación directa y atrás/adelante), re-login, idempotencia de la ráfaga de clic y guardarraíles de determinismo/localización. Se aplica Playwright + TypeScript con **POM aditivo**, contratos puros y **determinismo estricto** conforme a `docs/constitution.md` (§1 SDD, §2 aislamiento, §3 0 sleeps, §4 localizadores semánticos, §5 HITL).

## 2. Alcance y Precondición

- Vista bajo prueba: `https://www.saucedemo.com/inventory.html` con `standard_user`.
- **Precondición de sesión:** login por UI en `beforeEach` con `LoginPage` (patrón de `tests/checkout.spec.ts` y `tests/sort.spec.ts`), **desacoplado** de `001-login-saucedemo`.
- **Frontera de alcance:** la suite certifica **el acto de logout y sus postcondiciones**; **no** re-testa login (001), carrito/checkout (002/004) ni catálogo/orden (003/005). El re-login (RF-7) se verifica **solo** como restauración de sesión.
- **Ruta protegida normada:** exclusivamente `/inventory.html` (RF-5). Otras rutas quedan fuera de alcance (decisión HITL Q4).
- **Retrocompatibilidad total:** ninguna firma/locator existente de `InventoryPage` se elimina ni se altera; los cambios son estrictamente **aditivos** para no romper specs 001–005.

## 3. Archivos POM y de Pruebas

| Archivo | Acción | Responsabilidad única |
|---|---|---|
| `types/session.types.ts` | crear | Contratos y constantes de sesión **sin DOM**: `SESSION_COOKIE_NAME`, `SESSION_USER`, `PROTECTED_PATH`, `ROOT_URL_PATTERN`, `SAUCEDEMO_ORIGIN`, `SAUCEDEMO_DOMAIN`, `ANALYTICS_STORAGE_KEYS` y helpers puros `findSessionCookie(cookies)` / `hasSessionCookie(cookies)`. |
| `types/messages.types.ts` | modificar (aditivo) | Añadir `SESSION_MESSAGES = { guardedRoute: "Epic sadface: You can only access '/inventory.html' when you are logged in." }`. Conserva `LOGIN_ERROR_MESSAGES` intacto. |
| `pages/inventory.page.ts` | modificar (aditivo) | Añadir locators del header/menú (`burgerButton`, `menuPanel`, `logoutLink`, `inventoryContainer`, `errorBanner`) y métodos reactivos `openMenuAndSettle()`, `logoutAndSettle()`, `expectSettledAtLoginRoot()`, `expectGuardBanner()` y `getSessionCookie()`. Conserva todos los locators/métodos actuales (001–005). |
| `playwright.config.ts` | sin cambios | **Prohibido mutar infraestructura global (decisión HITL; H25).** La suite reutiliza `baseURL` y el proyecto `chromium`. |
| `fixtures/test-fixtures.ts` | sin cambios | `loginPage` e `inventoryPage` ya inyectados; el aislamiento por test ya está garantizado (§2). |
| `tests/logout.spec.ts` | crear | Suite TC-1 a TC-10 cubriendo RF-1 a RF-10 con aserciones reactivas, manejo determinista de `goBack()`/`goForward()` y navegación directa. |
| `package.json` | modificar (script) | Ampliar `lint:determinism` para cubrir **todo el árbol del arnés** (`pages/`, `tests/`, `fixtures/`, `types/`, `reporters/`, helpers) **incluyendo archivos no rastreados** (H23/N3). No se tocan otras claves. |

## 4. Modelado de Datos y Selectores

### 4.1 Contratos puros (`types/session.types.ts`, sin DOM)
```ts
import type { Cookie } from '@playwright/test';

export const SAUCEDEMO_ORIGIN = 'https://www.saucedemo.com';
export const SAUCEDEMO_DOMAIN = 'www.saucedemo.com';
export const SESSION_COOKIE_NAME = 'session-username';
export const SESSION_USER = 'standard_user';
export const PROTECTED_PATH = '/inventory.html';
export const ROOT_URL_PATTERN = /^https:\/\/www\.saucedemo\.com\/?$/;
export const ANALYTICS_STORAGE_KEYS = ['backtrace-guid', 'backtrace-last-active'] as const;

export function findSessionCookie(cookies: Cookie[]): Cookie | undefined; // cookies.find(c => c.name === SESSION_COOKIE_NAME)
export function hasSessionCookie(cookies: Cookie[]): boolean;             // findSessionCookie(cookies) !== undefined
```
- Helpers **puros** (sin I/O ni Playwright runtime salvo el tipo `Cookie`), testables de forma aislada.
- `SESSION_MESSAGES.guardedRoute` (en `types/messages.types.ts`) es la cadena exacta del banner del guard.

### 4.2 Selectores (prioridad semántica, constitución §4; justificación de último recurso en `spec.md` §*Selectores*)
| Elemento | Selector / API | Tipo |
|---|---|---|
| Burger de apertura | `page.getByRole('button', { name: 'Open Menu' })` (`#react-burger-menu-btn`) | Rol semántico (preferente) |
| Enlace Logout | `page.locator('[data-test="logout-sidebar-link"]')` | Atributo de contrato |
| Panel lateral | `page.locator('.bm-menu-wrap')` | CSS (último recurso **justificado**: nodo de `react-burger-menu`, sin `data-test`/rol; se lee `aria-hidden`) |
| Marcador de inventario | `page.locator('[data-test="inventory-container"]')` | Atributo de contrato (preferente; **no** `#inventory_container`, cuyo `id` está duplicado en el DOM → strict mode) |
| Banner del guard | `page.locator('[data-test="error"]')` | Atributo de contrato (consistente con `pages/login.page.ts`) |

> **Nota de localización (desviación justificada respecto al enunciado informal):** el criterio de "menú abierto" usa `toBeInViewport({ ratio: 1 })`, **no** `toBeVisible()`, porque el enlace con el menú cerrado es `isVisible() === true` estando off-screen (`x = -276`) — falso positivo caracterizado en `spec.md`. Prevalece la spec (Constitución §1).

## 5. Decisiones Técnicas y Alternativas Descartadas

1. **Extensión aditiva de `InventoryPage` (POM).** El header autenticado (título, link de carrito) ya reside en `InventoryPage`; el menú lateral es parte de ese mismo header. **Descartado** crear un directorio `components/` con un `SideMenuComponent`: no existe convención de composición en el repo (todo es `pages/*.page.ts`) e introduciría un patrón nuevo sin precedente.
2. **Criterio de "menú abierto" como conjunción AND (RF-1/RF-2).** `openMenuAndSettle()` espera `menuPanel` con `aria-hidden="false"` **y** `logoutLink` con `toBeInViewport({ ratio: 1 })`. **Descartados** `toBeVisible()` (falso positivo off-screen) y cualquier `waitForTimeout` (§3).
3. **Asentamiento de navegación vía aserciones web-first (RF-3/RF-6).** `logoutAndSettle()`/`expectSettledAtLoginRoot()` combinan `expect(page).toHaveURL(ROOT_URL_PATTERN)` **y** `expect(inventoryContainer).not.toBeVisible()`. **Descartado** aseverar sobre la URL inmediata de la navegación (carrera caracterizada: `/inventory.html` transitoria en `goBack`).
4. **Verificación de cookie sobre el contexto.** La presencia/ausencia de `session-username` se lee de `page.context().cookies()` vía `getSessionCookie()`/`findSessionCookie`. **Descartado** inferir la sesión del DOM (`document.cookie` no ve cookies no-`httpOnly` de forma fiable; la credencial no es `httpOnly` pero el estado autoritativo es el contexto). (§4 en spec.)
5. **Inyección de cookie para RF-5.** Los casos directo/sin-valor se fuerzan con `page.context().addCookies([{ name, value, url: SAUCEDEMO_ORIGIN }])` (valores `''` y `usuario_falso`; `url` **solo**, Playwright deriva `path`/`domain`) y cookie ausente con `clearCookies()`. **Descartado** manipular `document.cookie` por script (evita el `addCookies` tipado y el mismoSiteController).
6. **Idempotencia por ráfaga (RF-8).** Se ejecuta `logoutLink.click({ clickCount: 2 })` dentro del menú asentado, con un colector `page.on('pageerror', …)` adjunto **antes** de la acción; se asevera estado asentado en `/` **y** `pageErrors.length === 0`. **Descartado** contar navegaciones (`page.on('framenavigated')`): no es un oráculo estable ni exigido por la spec.
7. **RF-9 como non-goal acotado.** El test **asevera persistencia** de `ANALYTICS_STORAGE_KEYS` en `localStorage` (comportamiento esperado), pero **no** exige ni comprueba limpieza. **Descartado** aseverar la ausencia de esas claves (iría contra RF-9).
8. **Guardarraíl de determinismo ampliado (H23/N3).** `lint:determinism` se amplía a todo el árbol del arnés con `git grep --untracked` (§11). **Descartado** dejar el script limitado a `pages/` y `tests/`.
9. **Cero mutación de configuración global.** No se añade `testIdAttribute` ni `auth.setup.ts`; la sesión se obtiene por UI en `beforeEach` (§1/§5, H25).

## 6. Estrategia de Pruebas Playwright

Todos los casos viven en `tests/logout.spec.ts`, con `beforeEach` de login por UI y aislamiento por test. Aserciones **exclusivamente reactivas** (web-first), 0 sleeps.

| Caso | RF | Verificación determinista |
|---|---|---|
| TC-1 | RF-1 | `openMenuAndSettle()`: clic en `getByRole('button',{name:'Open Menu'})`; el panel queda abierto (`aria-hidden="false"`) y `logoutLink` es actionable (in-viewport, `ratio: 1`). |
| TC-2 | RF-2 | Discriminación del criterio: con menú **cerrado**, `logoutLink.isVisible() === true` pero `toBeInViewport({ ratio: 1 })` es **falso**; tras abrir, la conjunción AND es verdadera. Sin sleeps. |
| TC-3 | RF-3 | `logoutAndSettle()`: clic en `logoutLink`; `expect(page).toHaveURL(ROOT_URL_PATTERN)` sobre estado asentado. |
| TC-4 | RF-4 | Tras el logout, `getSessionCookie()` es `undefined` (lectura de `page.context().cookies()`, no del DOM). |
| TC-5 | RF-5 | Navegación directa a `/inventory.html` sin sesión válida en 3 sub-casos: cookie **ausente** (`clearCookies`), **vacía** (`''`) e **inválida** (`usuario_falso`); en los tres: redirect a `/` + banner `SESSION_MESSAGES.guardedRoute` visible. |
| TC-6 | RF-6 | Tras logout, una **secuencia acotada y determinista** que alterna `page.goBack()`/`page.goForward()` (evita agotar el historial → `about:blank`): estado asentado en `/`, `inventoryContainer` no visible, banner del guard visible. Aserción sobre estado asentado, nunca sobre URL inmediata. (Refinamiento por determinismo §3; ver Ajuste de auditoría 2026-10-15.) |
| TC-7 | RF-7 | Tras logout, `loginPage.goto()` + `loginWithValidCredentials()`: `expect(page).toHaveURL(/inventory\.html/)` **y** `findSessionCookie(...)` con `value === SESSION_USER`. |
| TC-8 | RF-8 | Colector `page.on('pageerror')` + `logoutLink.click({ clickCount: 2 })`: estado asentado en `/`, cookie eliminada, `pageErrors.length === 0`. |
| TC-9 | RF-9 | Tras logout, `session-username` ausente **y** `localStorage` **conserva** `ANALYTICS_STORAGE_KEYS` (asevera persistencia, no limpieza). |
| TC-10 | RF-10 | Guardarraíl estructural: el POM localiza el burger por rol, el logout y el marcador de inventario por `data-test` (sin CSS para esos tres; sin `#inventory_container`); único CSS `.bm-menu-wrap` con justificación §4; ausencia de `waitForTimeout`/`sleep` en el spec; `npm run lint:determinism` = 0 sleeps sobre todo el árbol. |

**Comandos:** `npx playwright test tests/logout.spec.ts --project=chromium`, `npm run lint:determinism`, `npm run test:all`, `npx tsc --noEmit`.

## 7. Matriz de Trazabilidad

| RF | Caso | Archivo | Propiedad auditada |
|---|---|---|---|
| RF-1 | TC-1 | `tests/logout.spec.ts` | Apertura del menú y disponibilidad de Logout |
| RF-2 | TC-2 | `tests/logout.spec.ts` | Criterio "menú abierto" (AND, no-circular) |
| RF-3 | TC-3 | `tests/logout.spec.ts` | Retorno asentado a la raíz |
| RF-4 | TC-4 | `tests/logout.spec.ts` | Eliminación de `session-username` |
| RF-5 | TC-5 | `tests/logout.spec.ts` | Guard de `/inventory.html` (3 sub-casos + banner) |
| RF-6 | TC-6 | `tests/logout.spec.ts` | Back/Forward bloqueados sobre estado asentado |
| RF-7 | TC-7 | `tests/logout.spec.ts` | Re-login restaura sesión válida |
| RF-8 | TC-8 | `tests/logout.spec.ts` | Idempotencia de la ráfaga (sin `pageerror`) |
| RF-9 | TC-9 | `tests/logout.spec.ts` | Non-goal acotado: analítica persiste |
| RF-10 | TC-10 | `tests/logout.spec.ts` + `lint:determinism` | Guardarraíles §3/§4 |

## 8. Aislamiento y Gestión de Estado

- Cada test abre su propio contexto/página y autentica en `beforeEach`; sin estado compartido (Constitución §2).
- RF-5 manipula la cookie **dentro de su propio contexto** (`clearCookies`/`addCookies`); no filtra a otros tests.
- El buffer de `pageerror` es **local** al test de RF-8.
- Cleanup implícito: Playwright cierra página/contexto al finalizar.

## 9. Convenciones

- `strict: true`, sin `any`; tipos explícitos y `Locator`/`Cookie` de `@playwright/test`.
- Archivos `*.page.ts`, `*.spec.ts`, `*.types.ts`.
- Prohibido `waitForTimeout`/`sleep`; sincronización solo por estado observable.

## 10. Riesgos y Supuestos

| Ítem | Riesgo | Mitigación |
|---|---|---|
| `click({ clickCount: 2 })` con navegación | Detach/acción interrumpida por el redirect | Ejecutar dentro del menú asentado; aseverar estado asentado final + `pageerror = 0`; si el AUT lo impide, usar `dblclick()` (misma semántica). |
| `goBack()` transitorio | URL inmediata `/inventory.html` antes de asentar | Aserción **solo** sobre estado asentado (`toHaveURL(ROOT) ∥ not.toBeVisible`). |
| `addCookies` dominio/url | Cookie no aplicada → falso verde | Usar `url: SAUCEDEMO_ORIGIN` **solo** (Playwright deriva `path`/`domain` y rechaza `url`+`path` juntos); verificar el efecto por el redirect + banner. |
| Localizador `.bm-menu-wrap` (§4, único CSS) | Cambios de layout del AUT | Último recurso justificado; si el AUT cambia, el test falla explícitamente. |
| Cambios a `inventory.page.ts` | Romper 001–005 | Cambios estrictamente aditivos; no tocar firmas existentes. |
| `lint:determinism` limitado | Falso "0 sleeps" | Ampliar a todo el árbol + no rastreados (`--untracked`). |

## 11. Checklist de Validación

- [x] `types/session.types.ts` con contratos/constantes y helpers puros (sin `any`).
- [x] `types/messages.types.ts` ampliado con `SESSION_MESSAGES.guardedRoute` (aditivo).
- [x] `inventory.page.ts` extendido (aditivo) con locators de menú y `openMenuAndSettle()` / `logoutAndSettle()` / `getSessionCookie()`.
- [x] `playwright.config.ts` intacto.
- [x] `tests/logout.spec.ts` cubriendo RF-1 a RF-10 (TC-1 a TC-10).
- [x] Matriz RF → TC 1:1 verificada, sin re-testear 001–005.
- [x] `lint:determinism` ampliado (todo el árbol + no rastreados) en verde; `npx tsc --noEmit` sin errores; `npm run test:all` en verde (001–006).

## 12. Referencias

- `specs/006-session-logout-saucedemo/spec.md`
- `docs/constitution.md`
- `pages/inventory.page.ts`, `pages/login.page.ts`, `types/messages.types.ts`, `fixtures/test-fixtures.ts`
- `tests/checkout.spec.ts` (patrón `beforeEach`), `tests/sort.spec.ts` (mapeo TC↔RF)
