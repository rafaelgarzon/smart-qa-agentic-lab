# Clave de la medición ciega (FAULT-04 a FAULT-09)

> Documento de calibración. El agente de triage no lo lee (AGENTS.md, regla 7).
> Sembrado: 2026-10-24 contra el bundle `assets/index-DnLqFcJI.js` de SauceDemo.
> Si SauceDemo publica un bundle nuevo y una cadena `find` desaparece, el fixture lanza
> `responsePatches: "<find>" no aparece en <url>`: hay que volver a sembrar, no es un resultado de triage.

| Fallo | Spec · RF | Proyecto | Categoría real |
|---|---|---|---|
| FAULT-04 | 002 · RF-4 | `chromium-04` | `BUG_PRODUCTO` |
| FAULT-05 | 004 · RF-5 | `chromium-05` | `SELECTOR_DESFASADO` |
| FAULT-06 | 006 · RF-9 | `chromium-06` | `DEFECTO_TEST` |
| FAULT-07 | 003 · RF-7 | `chromium-07` | `DATOS_O_ENTORNO` |
| FAULT-08 | 005 · RF-4 | `chromium-08` | `BUG_PRODUCTO` (con ruido) |
| FAULT-09 | 004 · RF-4 | `chromium-09` | `DEFECTO_TEST` (con ruido) |

## FAULT-04 · BUG_PRODUCTO
- **Inyección:** `responsePatches` en el bundle: el total final se calcula como `subtotal + impuesto + 0.01`.
- **Causa:** el producto factura un total que no es la suma del subtotal y el impuesto que muestra (contradice RF-4 de la spec 002).
- **Evidencia esperada:** `expect(received).toBe(expected)` en `pages/checkout-step-two.page.ts` (`verifyArithmeticTotals`), `Expected: 32.4`, `Received: 32.39`. El test llega a Checkout Overview sin problemas; los tres montos son visibles y se parsean.
- **Trampa:** la diferencia de un centavo puede leerse como un error de redondeo del test, pero el test redondea `(subtotal + tax)` a 2 decimales y compara contra lo que la UI muestra.

## FAULT-05 · SELECTOR_DESFASADO
- **Inyección:** `responsePatches` en el bundle: el `data-test` del botón "Continue Shopping" pasa de `continue-shopping` a `back-to-shopping`. El botón sigue visible, con el mismo texto y la misma función.
- **Causa:** el localizador `[data-test="continue-shopping"]` de `pages/cart.page.ts` quedó obsoleto frente al DOM.
- **Evidencia esperada:** `locator.click: Test timeout of 30000ms exceeded`, `waiting for locator('[data-test="continue-shopping"]')`. Los pasos previos del carrito (badge 2 → 1, eliminación) pasan.
- **Reparación esperada (/repair):** localizar por rol (`getByRole('button', { name: 'Continue Shopping' })`) o por el nuevo `data-test`, sin tocar ningún `expect`.

## FAULT-06 · DEFECTO_TEST
- **Inyección:** ninguna. El test asevera que `localStorage` queda vacío tras el logout.
- **Causa:** el test contradice la RF-9 de la spec 006, que acepta de forma explícita que la analítica `backtrace-*` persista y solo exige eliminar la cookie `session-username`.
- **Evidencia esperada:** `expect(received).toEqual(expected)` con `Expected: []` y `Received: ["backtrace-guid", "backtrace-last-active"]` en la línea 13. La aserción anterior (cookie ausente) pasa.

## FAULT-07 · DATOS_O_ENTORNO
- **Inyección:** `abortedRoutes: ['https://www.saucedemo.com/inventory.html']`. El login navega en el cliente y no pide ese documento; solo la recarga lo pide a la red.
- **Causa:** fallo de red (conexión rechazada) al recargar `/inventory.html`; no hay defecto de producto ni de test.
- **Evidencia esperada:** `page.reload: net::ERR_CONNECTION_FAILED` desde `pages/inventory.page.ts` (`reload`). Agregar al carrito y reordenar pasan antes.

## FAULT-08 · BUG_PRODUCTO (con ruido)
- **Inyección:** `responsePatches` en el bundle: el criterio `hilo` usa el comparador ascendente (`Qd`) en lugar del descendente (`$d`).
- **Causa:** "Price (high to low)" ordena de menor a mayor (contradice RF-4 de la spec 005).
- **Evidencia esperada:** timeout de 5000 ms de `expect(locator).toHaveText` dentro de `selectSortAndSettle` (`pages/inventory.page.ts`), `Expected: "Sauce Labs Fleece Jacket"`, `Received: "Sauce Labs Onesie"`.
- **Ruido:** el fallo es un timeout dentro de la espera de re-render (MEMORY documenta una carrera de re-render en el orden), tras un cambio consecutivo `za → hilo`, y apunta al POM y no al test. Sugiere `FLAKY` o `SELECTOR_DESFASADO`, pero el localizador resuelve y el valor recibido es estable: Onesie (7.99) es el primero de `lohi`, es decir, un orden invertido.

## FAULT-09 · DEFECTO_TEST (con ruido)
- **Inyección:** ninguna. Tras eliminar el último ítem, el test espera que el badge muestre `"0"`.
- **Causa:** el test contradice la RF-4 de la spec 004: con el carrito vacío el badge no se renderiza (no muestra `0`).
- **Evidencia esperada:** `expect(locator).toHaveText(expected)`, `Expected: "0"`, `element(s) not found`, `waiting for locator('[data-test="shopping-cart-badge"]')` en la última línea del test. La lista queda en 0 ítems (la aserción anterior pasa).
- **Ruido:** "element(s) not found" sobre un `data-test` sugiere `SELECTOR_DESFASADO`, pero el mismo localizador resolvió con `"1"` dos pasos antes en la misma vista.

## Resultados de /triage
| Fallo | Corrida 1 | Corrida 2 | Corrida 3 | Acierto |
|---|---|---|---|---|
| FAULT-04 | `DEFECTO_TEST` ❌ | | | |
| FAULT-05 | `DATOS_O_ENTORNO` ❌ | | | |
| FAULT-06 | `DEFECTO_TEST` ✅ | | | |
| FAULT-07 | `DATOS_O_ENTORNO` ✅ | | | |
| FAULT-08 | `SELECTOR_DESFASADO` ❌ | | | |
| FAULT-09 | `SELECTOR_DESFASADO` ❌ | | | |

## Notas de operación
- Ejecutar cada proyecto **sin** `--reporter` (por ejemplo `npx playwright test --config=playwright.faults.config.ts --project=chromium-05`). El flag reemplaza la lista de reporters del config, incluido `agent-context`, y entonces no se genera `test-results/last-failure.json`.
- `last-failure.json` se sobrescribe en cada corrida: lanzar /triage justo después de cada proyecto.
- Medición: 3 corridas por fallo, anotadas en la tabla "Resultados de /triage". No ajustar /triage a estos fallos.
- El proyecto `chromium` de `playwright.faults.config.ts` usa `testMatch: /fault-01\.spec\.ts/` (antes usaba `testIgnore`). Así no ejecuta los fallos nuevos; cada fallo nuevo necesita su propio proyecto con `testMatch`.
