# Tareas: Spec 004 — Gestión del Carrito SauceDemo

Estado: pendiente
Referencia: specs/004-cart-saucedemo/plan.md
Convención: tareas atómicas en orden de dependencia (20–30 min por tarea).

## Fase 0: Andamiaje y Modelado de Tipos (20 min)
- [x] **T1. Crear `types/cart.types.ts` con `CART_QUANTITY = 1`, `interface CartItem` (name/description/price/quantity) y reutilización de `PRICE_PATTERN` desde `inventory.types.ts`.** RF-1, RF-2, RF-10.
  - Archivos: `types/cart.types.ts`
  - Hecho cuando: compila con `strict` sin `any` y exporta `CART_QUANTITY`, `CartItem` y el patrón de precio compartido.

## Fase 1: Page Object Model — cambios aditivos (45 min)
- [ ] **T2. Extender `CartPage` con lectura de datos del carrito (nombres, descripciones, precios parseados, QTY y `getItemLocatorByName`).** RF-1, RF-2, RF-10.
  - Archivos: `pages/cart.page.ts`
  - Hecho cuando: getters tipados (`CartItem[]`, `number[]`, `string[]`) y `getItemLocatorByName(name)` retornan datos reales del DOM con precio vía `PRICE_PATTERN` + `parseFloat`.
- [ ] **T3. Extender `CartPage` con mutación y estado (remove por texto, badge, `continueShopping`, `reload` y validación de carrito vacío).** RF-3, RF-4, RF-5, RF-6, RF-8.
  - Archivos: `pages/cart.page.ts`
  - Hecho cuando: expone `removeItemByName`, lectura de badge, `clickContinueShopping`, `reload` y `verifyEmptyCart` (badge con `toHaveCount(0)`) sin sleeps, conservando `title`, `cartItems`, `checkoutButton`, `verifyCartLoaded` y `proceedToCheckout` (retrocompatibilidad con 002).

## Fase 2: Implementación de Pruebas E2E (110 min)
- [ ] **T4. TC-1 + TC-2 integridad de ítems y cantidad invariante QTY.** RF-1, RF-2.
  - Archivos: `tests/cart.spec.ts`, `fixtures/test-fixtures.ts`
  - Hecho cuando: `npx playwright test tests/cart.spec.ts -g "integridad|QTY" --project=chromium` en verde; cada ítem visible con nombre no vacío, descripción, precio `$XX.YY` y Remove habilitado; cada `item-quantity` con `toHaveText('1')`.
- [ ] **T5. TC-3 + TC-8 remove decrementa badge y eliminación múltiple secuencial (3→2→1).** RF-3, RF-8.
  - Archivos: `tests/cart.spec.ts`
  - Hecho cuando: tras cada remoción el conteo y el badge quedan sincronizados reactivamente en cada paso, sin desfases.
- [ ] **T6. TC-4 + TC-7 estado de carrito vacío por vaciamiento total y por deep-link a `/cart.html`.** RF-4, RF-7.
  - Archivos: `tests/cart.spec.ts`
  - Hecho cuando: con carrito vacío `cartItems` con `toHaveCount(0)` y badge con `toHaveCount(0)`, sin errores ni estados inconsistentes.
- [ ] **T7. TC-5 + TC-9 `Continue Shopping` preserva badge y regreso al inventario restaura "Add to cart".** RF-5, RF-9.
  - Archivos: `tests/cart.spec.ts`
  - Hecho cuando: la URL vuelve a `/inventory.html` con badge intacto y el ítem removido muestra acción `/add to cart/i`.
- [ ] **T8. TC-6 persistencia del carrito restante y badge tras `reload()`.** RF-6.
  - Archivos: `tests/cart.spec.ts`
  - Hecho cuando: tras recargar se conservan exactamente los ítems restantes (mismos nombres), el badge se mantiene y el ítem removido no reaparece.
- [ ] **T9. TC-10 inmutabilidad de nombres, descripción, precio y QTY de los ítems no removidos.** RF-10.
  - Archivos: `tests/cart.spec.ts`
  - Hecho cuando: el `CartItem` capturado antes de remover coincide campo a campo con el ítem que permanece tras la operación.

## Fase 3: Quality Gate y Auditoría Final (20 min)
- [ ] **T10. Verificación de determinismo y regresión completa sin romper 001/002/003.** RF-11.
  - Archivos: todo el repo
  - Hecho cuando: `npm run lint:determinism` reporta 0 sleeps y `npm run test:all` pasa en verde en Chromium sin regresión en `auth.spec.ts`, `checkout.spec.ts` ni `inventory.spec.ts`.

---

## Cobertura y división
- Total: **10 tareas** (≤ límite), por lo que **no se requiere dividir la especificación**.
- Trazabilidad 1:1: RF-1/2 → T4 · RF-3 → T5 · RF-4 → T6 · RF-5 → T7 · RF-6 → T8 · RF-7 → T6 · RF-8 → T5 · RF-9 → T7 · RF-10 → T9 · RF-11 → T10 (RF-1, RF-2 y RF-10 también soportados por T1–T2).
