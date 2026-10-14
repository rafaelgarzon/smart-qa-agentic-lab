# Tasks: Spec 005 — Ordenamiento Algorítmico del Catálogo SauceDemo

Plan base: `specs/005-sort-saucedemo/plan.md`
Spec base: `specs/005-sort-saucedemo/spec.md` (Estado: aprobada)
Convención: una tarea por sesión de implementación (máx. 20-30 min), tests primero.

> Nota de granularidad: el desglose genera **11 tareas** (>10 del umbral sugerido). Se mantiene el mapeo 1:1 RF↔caso para trazabilidad estricta; si se desea menor granularidad, la Fase 2 (T3..T10) puede dividirse en dos sub-suites (`sort.lexical.spec.ts` y `sort.numeric.spec.ts`) sin partir la especificación.

---

## Fase 0 — Tipos y contratos

- [x] **T1. Crear `types/sort.types.ts` con contratos y oráculos puros** RF-1, RF-2, RF-3, RF-4, RF-5
  Definir `SortOption = 'az' | 'za' | 'lohi' | 'hilo'`, `GoldenProduct`, `GOLDEN_PRODUCTS` (los 6 productos fijos), `TIE_PRICE = 15.99`, el comparador `localeCompareEn` (`'en'`, `{ sensitivity: 'variant' }`) y las funciones puras `expectedNames(option)` / `expectedPrices(option)` con desempate A-Z explícito. Sin dependencia del DOM ni de Playwright.
  Hecho cuando: `npx tsc --noEmit` compila sin `any`, y `expectedNames('lohi')[2..3] === ['Sauce Labs Bolt T-Shirt','Test.allTheThings() T-Shirt (Red)']`.

## Fase 1 — Extensión POM aditiva

- [x] **T2. Extender `pages/inventory.page.ts` y habilitar locator semántico** RF-6, RF-7, RF-8
  Añadido de forma **aditiva**: locator `sortDropdown` vía `page.locator('[data-test="product-sort-container"]')` (fallback documentado `select.product_sort_container`; **NO se modifica `playwright.config.ts`** por decisión HITL), locator `firstItemTitle`, el método reactivo `selectSortAndSettle(option)` que espera el asentamiento del primer ítem (`expect(firstItemTitle).toHaveText(expectedNames(option)[0])`) y los lectores tipados `getItemNames()` / `getItemPrices()`. Los helpers de navegación `openProductDetail(name)` / `goBackToProducts()` se difieren a T8 (Flujo B de RF-6). Conservados intactos todos los locators y métodos actuales (001–004).
  Hecho cuando: `npm run test:all` sigue en verde para las suites 001–004 y `npm run lint:determinism` reporta 0 sleeps.

## Fase 2 — Pruebas E2E (mapeo 1:1 RF-1..RF-8)

- [x] **T3. TC-1 — RF-1: oráculo léxico A-Z y monotonicidad** RF-1
  En `tests/sort.spec.ts`: `selectSortAndSettle('az')`; `expect(nombres).toEqual(expectedNames('az'))`; validar relación monótona no decreciente con `localeCompareEn` par a par.
  Hecho cuando: el test pasa en Chromium y falla si se altera el orden del DOM.

- [x] **T4. TC-2 — RF-2: oráculo léxico Z-A y monotonicidad** RF-2
  `selectSortAndSettle('za')`; `toEqual(expectedNames('za'))`; monótona no creciente bajo `localeCompareEn`.
  Hecho cuando: el test pasa en Chromium.

- [x] **T5. TC-3 — RF-3: oráculo numérico low→high y monotonicidad** RF-3
  `selectSortAndSettle('lohi')`; precios parseados con `^\$(\d+\.\d{2})$` + `parseFloat`; `toEqual(expectedPrices('lohi'))` (igualdad estricta); monótona no decreciente.
  Hecho cuando: el test pasa en Chromium.

- [x] **T6. TC-4 — RF-4: oráculo numérico high→low y monotonicidad** RF-4
  `selectSortAndSettle('hilo')`; `toEqual(expectedPrices('hilo'))`; monótona no creciente.
  Hecho cuando: el test pasa en Chromium.

- [x] **T7. TC-5 — RF-5: desempate A-Z determinista ante `$15.99`** RF-5
  `selectSort('za')` y luego `selectSortAndSettle('lohi')`: el par `$15.99` debe ser `['Sauce Labs Bolt T-Shirt','Test.allTheThings() T-Shirt (Red)']`; repetir la secuencia `za → hilo`.
  Hecho cuando: ambas secuencias fijan el empate en A-Z y el test falla si se invierte.

- [ ] **T8. TC-6 — RF-6: reset invariante a `az`** RF-6
  Tras `selectSort('za')`, verificar reset a `az` en: (a) `reload()`; (b) Flujo A (`/cart.html` + `Continue Shopping`); (c) Flujo B (detalle de "Sauce Labs Backpack" + `Back to products`). Validar valor del `<select>` y primer ítem `expectedNames('az')[0]`. Requiere añadir previamente los helpers `openProductDetail(name)` / `goBackToProducts()` al POM (diferidos desde T2).
  Hecho cuando: los tres escenarios confirman `az` y el test pasa en Chromium.

- [ ] **T9. TC-7 — RF-7: asentamiento reactivo del re-render** RF-7
  Para los 4 criterios, invocar `selectSortAndSettle` y confirmar que el primer ítem serializado coincide con `expectedNames(option)[0]` (sin lectura stale ni curso de carrera).
  Hecho cuando: el test pasa de forma repetible (ejecución consecutiva sin flakiness).

- [ ] **T10. TC-8 — RF-8: guardarraíles de locator y determinismo** RF-8
  Verificar que el control se localiza vía el locator semántico expuesto por el POM y que no hay serialización sin aserción reactiva previa; asegurar 0 usos de `waitForTimeout`/`sleep` en `tests/sort.spec.ts`.
  Hecho cuando: `npm run lint:determinism` reporta 0 sleeps y el test estructural pasa.

## Fase 3 — Quality Gate transversal

- [ ] **T11. Quality Gate: determinismo, no-regresión y trazabilidad** RF-1..RF-8
  Ejecutar `npm run lint:determinism` (0 sleeps) y `npm run test:all` (Chromium, suites 001..005 en verde). Verificar la matriz de trazabilidad RF → TC del plan y la ausencia de solapamiento con la UI elemental de 003.
  Hecho cuando: `lint:determinism` limpio y `test:all` en verde incluyendo `tests/sort.spec.ts` (N+8 tests), con matriz RF→TC confirmada.
