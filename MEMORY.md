# MEMORY - Smart QA Agentic Lab

## Estado del Repositorio
- Fecha: 2026-10-15
- Rama: `feature/006-logout-spec` (spec 006 cerrada formalmente; working tree limpio).
- Metodología: Spec-Driven Development (SDD) con arnés agéntico y control HitL.

## Especificaciones Consolidadas
- `specs/001-login-saucedemo`: 100% cerrada (RF-1 a RF-6 cubiertos, 5/5 passed en Chromium).
- `specs/002-checkout-saucedemo`: 100% cerrada (RF-1 a RF-6 cubiertos, 3/3 passed en Chromium).
  - RF-1: Selección de producto, alternancia de botón a Remove e incremento de badge en catálogo.
  - RF-2: Navegación a `/cart.html` y verificación de consistencia de ítems.
  - RF-3: Manejo de errores de validación en `/checkout-step-one.html` y avance exitoso.
  - RF-4: Comprobación aritmética determinista de totales (`Item total + Tax === Total`) en `/checkout-step-two.html`.
  - RF-5: Confirmación de orden en `/checkout-complete.html` con mensaje canónico y retorno a catálogo.
  - RF-6: Determinismo transversal verificado (0 pausas estáticas, script `lint:determinism` limpio).
- `specs/003-inventory-saucedemo`: 100% cerrada (RF-1 a RF-8 cubiertos, 7/7 passed en Chromium).
  - RF-1: Integridad visual del catálogo (6 ítems con nombre, descripción, precio `$XX.YY` y acción habilitada).
  - RF-2/RF-3: Orden por defecto A-Z y criterio Name Z-A.
  - RF-4/RF-5: Orden numérico por precio low→high y high→low.
  - RF-6: Estabilidad determinista ante empates de precio (`$15.99`).
  - RF-7: Persistencia de ítem y badge tras encadenar ordenamientos y `reload()`.
  - RF-8: Determinismo transversal verificado.
  - POM extendido: `pages/inventory.page.ts`; tipos: `types/inventory.types.ts`.
- `specs/004-cart-saucedemo`: 100% cerrada (RF-1 a RF-11 cubiertos, 10/10 passed en Chromium).
  - Integridad de ítems del carrito (nombre no vacío, descripción, precio `$XX.YY`, Remove habilitado) y QTY invariante `1`.
  - Eliminación con decremento reactivo del badge; vaciado total con badge oculto (`toHaveCount(0)`).
  - `Continue Shopping` preserva el badge y regresa a `/inventory.html`; consistencia cruzada con el catálogo (restaura "Add to cart").
  - Persistencia de ítems restantes y badge tras `reload()`; deep-link a `/cart.html` con carrito vacío válido.
  - Inmutabilidad de ítems no removidos (nombre, descripción, precio, QTY) y determinismo transversal.
  - Capacidades incorporadas:
    - `types/cart.types.ts`: contratos tipados (`CartItem`) e invariante `CART_QUANTITY = 1` (reexport de `PRICE_PATTERN`).
    - `pages/cart.page.ts`: extensión aditiva con getters tipados, mutación reactiva y navegación (retrocompatible con spec 002).
    - `tests/cart.spec.ts`: 10 tests E2E cubriendo RF-1 a RF-11.
- `specs/005-sort-saucedemo`: 100% cerrada (RF-1 a RF-8 cubiertos, 8/8 passed en Chromium).
  - RF-1/RF-2: oráculos léxicos A-Z y Z-A idénticos a `expectedNames(option)` con monotonicidad no decreciente/no creciente.
  - RF-3/RF-4: oráculos numéricos low→high y high→low idénticos a `expectedPrices(option)` con monotonicidad verificada.
  - RF-5: desempate A-Z determinista ante empates de `$15.99` (`Bolt` antes de `Test.allTheThings()`), independiente del criterio previo (`za → lohi` y `za → hilo`).
  - RF-6: el criterio se restablece a `az` tras `reload()`, roundtrip al carrito (`Continue Shopping`) y roundtrip al detalle (`Back to products`).
  - RF-7: asentamiento reactivo del re-render — primer ítem capturado nunca es lectura stale (0 curso de carrera).
  - RF-8: locator semántico `[data-test="product-sort-container"]` expuesto por el POM, 4 opciones reactivas, sin mutación de `playwright.config.ts`.
  - Capacidades incorporadas:
    - `types/sort.types.ts`: contratos y oráculos puros (`SortOption`, `GOLDEN_PRODUCTS`, `TIE_PRICE = 15.99`, `localeCompareEn`, `expectedNames`, `expectedPrices`).
    - `pages/inventory.page.ts`: extensión aditiva (`sortDropdown`, `firstItemTitle`, `selectSortAndSettle`, `getItemNames`/`getItemPrices`, `openProductDetail`, `goBackToProducts`).
    - `tests/sort.spec.ts`: 8 tests E2E cubriendo RF-1 a RF-8 (TC-1..TC-8).
- `specs/006-session-logout-saucedemo`: 100% cerrada (RF-1 a RF-10 cubiertos, 10/10 passed en Chromium).
  - RF-1/RF-2: apertura del menú hamburguesa y criterio "menú abierto" como conjunción estricta AND (`aria-hidden="false"` + enlace Logout `toBeInViewport({ ratio: 1 })`), descartando `toBeVisible()` (falso positivo off-screen).
  - RF-3: el logout retorna a `/` en estado asentado (URL raíz + inventario no expuesto), sin aseverar la URL inmediata de la navegación.
  - RF-4: eliminación de la cookie `session-username` verificada sobre `browserContext.cookies()` (estado del contexto, no locator del DOM).
  - RF-5: el guard de `/inventory.html` deniega cookie ausente, vacía (`''`) e inválida (`usuario_falso`) → redirect a `/` + banner `Epic sadface: You can only access '/inventory.html' when you are logged in.`.
  - RF-6: atrás/adelante post-logout sobre estado asentado (secuencia acotada alternando back/forward); nunca expone contenido protegido.
  - RF-7: el re-login tras el logout restaura una sesión válida (`session-username=standard_user`).
  - RF-8: idempotencia de la ráfaga (doble clic) sin `pageerror` y con la cookie eliminada.
  - RF-9: non-goal de `localStorage` — la analítica no-auth (`backtrace-guid`, `backtrace-last-active`) persiste tras el logout (se asevera persistencia, no limpieza).
  - RF-10: guardarraíles de localización semántica (rol / `data-test`) y determinismo (0 sleeps); `.bm-menu-wrap` como único CSS §4 justificado.
  - Capacidades incorporadas:
    - `types/session.types.ts`: contratos/constantes (`SAUCEDEMO_ORIGIN`, `SAUCEDEMO_DOMAIN`, `SESSION_COOKIE_NAME`, `SESSION_USER`, `PROTECTED_PATH`, `ROOT_URL_PATTERN`, `ANALYTICS_STORAGE_KEYS`) y helpers puros `findSessionCookie`/`hasSessionCookie`.
    - `types/messages.types.ts`: `SESSION_MESSAGES.guardedRoute` (aditivo, conserva `LOGIN_ERROR_MESSAGES`).
    - `pages/inventory.page.ts`: extensión aditiva de menú/logout (`openMenuAndSettle`, `logoutAndSettle` idempotente, `expectSettledAtLoginRoot`, `expectGuardBanner`, `getSessionCookie`).
    - `tests/logout.spec.ts`: 10 tests E2E cubriendo RF-1 a RF-10 (TC-1..TC-10).
  - Nota de auditoría: el marcador de inventario se localiza por `[data-test="inventory-container"]` (el `id="inventory_container"` está duplicado en el DOM → violación de strict mode).

## Suite de Regresión Global
- `npm run test:all`: 43 passed en Chromium (auth 5 + checkout 3 + inventory 7 + cart 10 + sort 8 + logout 10) — specs 001 a 006.
- `npm run lint:determinism`: 0 sleeps / 0 `waitForTimeout` en todo el arnés (script ampliado a todo el árbol + archivos no rastreados vía `git grep --untracked`).

## Capacidades de Calibración RCA
- `FAULT-01`: `SELECTOR_DESFASADO` (100% de precisión).
- `FAULT-02`: `BUG_PRODUCTO` (100% de precisión).
- `FAULT-03`: `DATOS_O_ENTORNO` (interrupción de red sembrada).
