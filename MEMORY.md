# MEMORY - Smart QA Agentic Lab

## Estado del Repositorio
- Fecha: 2026-10-14
- Rama: `feature/004-cart-spec` (spec 004 cerrada formalmente; working tree limpio).
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

## Suite de Regresión Global
- `npm run test:all`: 25 passed en Chromium (auth 5 + checkout 3 + inventory 7 + cart 10) — specs 001 a 004.
- `npm run lint:determinism`: 0 sleeps / 0 `waitForTimeout` en todo el arnés.

## Capacidades de Calibración RCA
- `FAULT-01`: `SELECTOR_DESFASADO` (100% de precisión).
- `FAULT-02`: `BUG_PRODUCTO` (100% de precisión).
- `FAULT-03`: `DATOS_O_ENTORNO` (interrupción de red sembrada).
