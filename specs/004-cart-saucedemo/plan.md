# Plan Técnico: Spec 004 — Gestión del Carrito SauceDemo

**Especificación base:** `specs/004-cart-saucedemo/spec.md`
**Fecha:** 2026-10-14
**Idioma:** Español
**Equipo/Role:** Test Automation Lead Architect

---

## 1. Objetivo del Plan

Diseñar la arquitectura técnica para cubrir los requisitos funcionales RF-1 a RF-11 de la spec 004: integridad de los ítems en el carrito, cantidad invariante (QTY=1), eliminación con decremento de badge, estado de carrito vacío, `Continue Shopping`, persistencia tras recarga, acceso directo, consistencia con inventario e inmutabilidad de ítems restantes. Se aplica **Playwright + TypeScript** con **POM modular**, **determinismo estricto** y **aislamiento total** conforme a `docs/constitution.md`.

## 2. Alcance y Precondición

- Vista bajo prueba: `https://www.saucedemo.com/cart.html` con `standard_user`.
- Navegación base y consistencia de ítems (spec 002), inventario/orden (spec 003) y autenticación (spec 001) quedan fuera de alcance.
- **Precondición de sesión:** cada test autentica por UI mediante `LoginPage` dentro de un `beforeEach`, reutilizando el patrón vigente en `tests/checkout.spec.ts`. Salvo el caso de deep-link vacío, cada test añade ítems por UI mediante `InventoryPage` antes de navegar al carrito.
- **Directriz del arnés:** NO se modifica `playwright.config.ts` ni se añade `auth.setup.ts` global. La sesión se gestiona con `beforeEach` desacoplado para proteger la configuración compartida.

## 3. Archivos POM y de Pruebas

| Archivo | Acción | Responsabilidad única |
|---|---|---|
| `types/cart.types.ts` | crear | `CART_QUANTITY = 1`, `interface CartItem { name; description; price: number; quantity: number }` y reutilización de `PRICE_PATTERN` desde `inventory.types.ts`. |
| `pages/cart.page.ts` | modificar | Extender el POM existente de forma aditiva: lectura de ítems/columnas, QTY, remoción por nombre, `Continue Shopping`, badge, `reload` y estado vacío. Conserva `title`, `cartItems`, `checkoutButton`, `verifyCartLoaded`, `proceedToCheckout` (retrocompatibilidad con 002). |
| `tests/cart.spec.ts` | crear | Suite de casos TC-1 a TC-10 cubriendo RF-1 a RF-10. |
| `fixtures/test-fixtures.ts` | sin cambios | Ya expone `cartPage` e `inventoryPage` con aislamiento por test; no requiere nuevas dependencias globales. |

## 4. Modelado de Datos y Selectores

Prioridad semántica/`data-test` conforme a constitución §4 y al patrón dominante del repo.

| Elemento | Selector / API |
|---|---|
| Título de vista | `[data-test="title"]` (ya en POM) |
| Ítem de carrito | `[data-test="inventory-item"]` (ya en POM como `cartItems`) |
| Cantidad (QTY) | `[data-test="item-quantity"]` |
| Nombre | `[data-test="inventory-item-name"]` |
| Descripción | `[data-test="inventory-item-desc"]` |
| Precio | `[data-test="inventory-item-price"]` |
| Acción Remove | `button` interno del ítem con texto `/remove/i` (agnóstico al `data-test="remove-<slug>"`) |
| Badge del carrito | `[data-test="shopping-cart-badge"]` (no renderizado si vacío) |
| Continue Shopping | `[data-test="continue-shopping"]` |
| Checkout (salida) | `[data-test="checkout"]` (ya en POM) |

- **Parseo de precio:** reutiliza `PRICE_PATTERN = /\$([0-9]+\.[0-9]{2})/` de `types/inventory.types.ts` → `parseFloat`, mismo criterio que `InventoryPage.parsePrice`.
- **Modelado de ítem:** `CartItem` tipado con `price: number` y `quantity: number`.
- **Ítem por nombre:** filtrado `cartItems.filter({ has: nombre })`, mismo enfoque que `InventoryPage.getItemLocatorByName`.

## 5. Decisiones Técnicas y Alternativas Descartadas

1. **Badge oculto en vacío (RF-4):** se valida con `await expect(badge).toHaveCount(0)`, pues SauceDemo no renderiza el nodo cuando el carrito está vacío. Descartado `toHaveText('0')` (no existe el nodo) y `toBeHidden()` (asume nodo presente).
2. **Remove por texto, no por slug:** el botón se localiza por texto `/remove/i` dentro del ítem. Descartado el `data-test="remove-<slug>"` para no acoplar el POM a slugs de producto concretos.
3. **QTY invariante (RF-2):** se certifica `quantity === 1` para cada ítem, modelando el contrato real de SauceDemo (sin incremento de cantidad). Descartado asumir cantidades > 1 inexistentes en el AUT.
4. **Precondición de sesión:** `beforeEach` con login UI sobre `LoginPage`. Descartado `storageState`/`auth.setup.ts` por directriz de proteger el arnés compartido (evita tocar `playwright.config.ts`).
5. **Persistencia (RF-6):** mismo `page`/contexto dentro del test + `page.reload()` + revalidación reactiva. Descartado abrir nuevo contexto (el carrito de SauceDemo es por sesión de navegador).
6. **Deep-link (RF-7):** `page.goto('/cart.html')` tras autenticar sin añadir ítems. Descartado forzar el estado vacío removiendo ítems (no certifica el acceso directo).
7. **Cambios aditivos en `CartPage`:** no alterar métodos/locators existentes para no romper `tests/checkout.spec.ts`.

## 6. Estrategia de Pruebas Playwright

| Caso | RF | Verificación determinista |
|---|---|---|
| TC-1 Integridad de ítems del carrito | RF-1 | Añadir ≥2 ítems; `toHaveCount(n)`; por ítem: nombre no vacío `toBeVisible`, descripción visible, precio matchea `$XX.YY`, botón Remove `toBeEnabled`. |
| TC-2 Cantidad invariante QTY | RF-2 | Cada `[data-test="item-quantity"]` `toHaveText('1')`; array de cantidades `toEqual(Array(n).fill(1))`. |
| TC-3 Remove decrementa badge | RF-3 | Añadir 2; remover uno; `toHaveCount(n-1)` y badge `toHaveText('1')`. |
| TC-4 Vaciamiento total | RF-4 | Remover todos; `cartItems` `toHaveCount(0)`; badge `toHaveCount(0)`. |
| TC-5 Continue Shopping | RF-5 | Con 1 ítem restante tras remover otro; clic en `continue-shopping`; URL `/inventory.html`; badge `toHaveText('1')`. |
| TC-6 Persistencia tras reload | RF-6 | Remover 1 de 2; `reload()`; ítems restantes idénticos (nombres) y badge estable; ítem removido ausente. |
| TC-7 Acceso directo (deep-link) vacío | RF-7 | `page.goto('/cart.html')` tras login sin añadir; `verifyCartLoaded()`; `cartItems` `toHaveCount(0)`; badge `toHaveCount(0)`. |
| TC-8 Eliminación múltiple secuencial | RF-8 | Añadir 3; remover en bucle verificando badge decreciente (3→2→1) reactivo en cada paso. |
| TC-9 Consistencia con inventario | RF-9 | Añadir ítem; ir al carrito; remover; volver al inventario; botón del ítem `toHaveText(/add to cart/i)` y badge oculto/ausente. |
| TC-10 Inmutabilidad de restantes | RF-10 | Añadir 2; capturar `CartItem[]`; remover el otro; ítem restante conserva nombre/descripción/precio/QTY. |
| (transversal) | RF-11 | `npm run lint:determinism` = 0 sleeps; esperas vía `expect` reactivo. |

**Comandos:** `npx playwright test tests/cart.spec.ts --project=chromium` y `npm run lint:determinism`.

## 7. Matriz de Trazabilidad

| RF | Caso | Archivo |
|---|---|---|
| RF-1 | TC-1 | `tests/cart.spec.ts` |
| RF-2 | TC-2 | `tests/cart.spec.ts` |
| RF-3 | TC-3 | `tests/cart.spec.ts` |
| RF-4 | TC-4 | `tests/cart.spec.ts` |
| RF-5 | TC-5 | `tests/cart.spec.ts` |
| RF-6 | TC-6 | `tests/cart.spec.ts` |
| RF-7 | TC-7 | `tests/cart.spec.ts` |
| RF-8 | TC-8 | `tests/cart.spec.ts` |
| RF-9 | TC-9 | `tests/cart.spec.ts` |
| RF-10 | TC-10 | `tests/cart.spec.ts` |
| RF-11 | Gate | `npm run lint:determinism` |

## 8. Aislamiento y Gestión de Estado

- Cada test abre su propio contexto/página y autentica en `beforeEach`; sin estado compartido ni dependencia de orden de ejecución (constitución §2).
- Sin `storageState` compartido ni caché de sesión; el carrito es estado por sesión de navegador y se prepara explícitamente en cada test.
- Datos fijos y explícitos (`standard_user` / `secret_sauce`).
- Cleanup implícito: Playwright cierra la página/contexto al finalizar.

## 9. Convenciones

- `strict: true`, sin `any`; tipos explícitos y `Locator` de `@playwright/test`.
- Archivos `*.page.ts`, `*.spec.ts`, `*.types.ts`.
- Prohibido `waitForTimeout`/`sleep`; sincronización solo por estado observable.

## 10. Riesgos y Supuestos

| Ítem | Riesgo | Mitigación |
|---|---|---|
| Badge en vacío | El nodo no se renderiza cuando el carrito está vacío | Validar con `toHaveCount(0)`, no `toHaveText('0')`. |
| Selector de Remove | `data-test` por slug acopla a nombres de producto | Localizar por texto `/remove/i` dentro del ítem. |
| Deep-link a `/cart.html` | Requiere sesión válida previa | Login en `beforeEach` y `goto()` directo sin añadir ítems. |
| Cambios a `cart.page.ts` | No romper `tests/checkout.spec.ts` | Cambios aditivos; conservar locators/métodos actuales. |
| Cierre del detalle de ítem | Click en nombre puede navegar a detalle | Operar sobre botones/columnas, no sobre el enlace de nombre. |

## 11. Checklist de Validación

- [ ] `types/cart.types.ts` con `CART_QUANTITY` y `CartItem` tipados (sin `any`).
- [ ] `CartPage` extendido con lectura de ítems, QTY, remove, badge, continue shopping, reload y estado vacío.
- [ ] `tests/cart.spec.ts` cubriendo RF-1 a RF-10.
- [ ] Matriz RF → test 1:1 verificada.
- [ ] `lint:determinism` limpio (0 sleeps).
- [ ] Suite completa `npm run test:all` en verde en Chromium (sin regresión en 001/002/003).

## 12. Referencias

- `specs/004-cart-saucedemo/spec.md`
- `docs/constitution.md`
- `pages/cart.page.ts`, `pages/inventory.page.ts`, `pages/login.page.ts`
- `fixtures/test-fixtures.ts`, `types/inventory.types.ts`
