# Tareas: Spec 003 — Inventario SauceDemo

Estado: pendiente
Referencia: specs/003-inventory-saucedemo/plan.md

## Fase 0: Andamiaje y Modelado de Tipos (15 min)
- [x] **T1. Crear `types/inventory.types.ts`** con `SORT_OPTIONS` (label↔value `az|za|lohi|hilo`), `EXPECTED_PRODUCT_COUNT = 6`, `interface InventoryProduct` y regex de precio. RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7.
  - Archivos: `types/inventory.types.ts`
  - Hecho cuando: compila con `strict` sin `any` y exporta los tipos y etiquetas de ordenamiento.

## Fase 1: Page Object Model (35 min)
- [x] **T2. Extender `InventoryPage` para lectura de datos del catálogo.** RF-1.
  - Archivos: `pages/inventory.page.ts`
  - Hecho cuando: `getProductNames()`, `getProductDescriptions()`, `getProductPrices()` y `getItemsCount()` retornan datos reales del DOM tipados.
- [x] **T3. Extender `InventoryPage` con control de orden y secuencia.** RF-2, RF-3, RF-4, RF-5.
  - Archivos: `pages/inventory.page.ts`
  - Hecho cuando: `selectSort(label)` aplica el criterio y los getters reflejan el nuevo orden del DOM.
- [x] **T4. Extender `InventoryPage` con estado de botón por ítem, badge y recarga.** RF-7.
  - Archivos: `pages/inventory.page.ts`
  - Hecho cuando: expone `getItemButtonByName()`, `getCartBadgeText()` y `reload()` sin sleeps.

## Fase 2: Implementación de Pruebas E2E (40 min)
- [x] **T5. TC-1 integridad del catálogo (6 ítems con nombre, descripción, precio `$XX.YY` y botón habilitado).** RF-1.
  - Archivos: `tests/inventory.spec.ts`, `fixtures/test-fixtures.ts`
  - Hecho cuando: `npx playwright test tests/inventory.spec.ts -g "integridad" --project=chromium` en verde.
- [x] **T6. TC-2/TC-3 orden por defecto A-Z y Name Z-A.** RF-2, RF-3.
  - Archivos: `tests/inventory.spec.ts`
  - Hecho cuando: la secuencia del DOM iguala la esperada en ambos sentidos.
- [ ] **T7. TC-4/TC-5 orden por precio low→high y high→low.** RF-4, RF-5.
  - Archivos: `tests/inventory.spec.ts`
  - Hecho cuando: los precios numéricos coinciden con el `sort` esperado.
- [ ] **T8. TC-6 estabilidad determinista ante empates de precio (`$15.99`).** RF-6.
  - Archivos: `tests/inventory.spec.ts`
  - Hecho cuando: dos pasadas consecutivas del mismo criterio producen secuencia de nombres idéntica.
- [ ] **T9. TC-7 persistencia de carrito y badge tras encadenar orden + `reload()`.** RF-7.
  - Archivos: `tests/inventory.spec.ts`
  - Hecho cuando: estado "Remove" y badge constantes tras 4 reordenamientos y recarga.

## Fase 3: Quality Gate y Auditoría Final (15 min)
- [ ] **T10. Verificación de determinismo y regresión completa.** RF-8.
  - Archivos: todo el repo
  - Hecho cuando: `npm run lint:determinism` reporta 0 sleeps y `npm run test:all` pasa en verde en Chromium.
