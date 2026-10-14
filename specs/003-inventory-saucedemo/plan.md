# Plan Técnico: Spec 003 — Inventario SauceDemo

**Especificación base:** `specs/003-inventory-saucedemo/spec.md`
**Fecha:** 2026-10-14
**Idioma:** Español
**Equipo/Role:** Test Automation Lead Architect

---

## 1. Objetivo del Plan

Diseñar la arquitectura técnica para cubrir los requisitos funcionales RF-1 a RF-8 de la spec 003: integridad visual del catálogo, las cuatro modalidades de ordenamiento, la estabilidad ante empates y la persistencia del carrito ante reordenamiento y recarga. Se aplica **Playwright + TypeScript** con **POM modular**, **determinismo estricto** y **aislamiento total** conforme a `docs/constitution.md`.

## 2. Alcance y Precondición

- Vista bajo prueba: `https://www.saucedemo.com/inventory.html` con `standard_user`.
- Login (spec 001) y checkout (spec 002) fuera de alcance.
- **Precondición de sesión:** cada test autentica por UI mediante `LoginPage` dentro de un `beforeEach`, reutilizando el patrón ya vigente en `tests/checkout.spec.ts`.
- **Directriz del arnés:** NO se modifica `playwright.config.ts` ni se añade `auth.setup.ts` global. La sesión se gestiona con `beforeEach`/fixture desacoplado para proteger la configuración compartida.

## 3. Archivos POM y de Pruebas

| Archivo | Acción | Responsabilidad única |
|---|---|---|
| `types/inventory.types.ts` | crear | `SORT_OPTIONS` (label↔value de las 4 modalidades), `EXPECTED_PRODUCT_COUNT = 6`, `interface InventoryProduct { name; description; price: number }` y regex de precio `$XX.YY`. |
| `pages/inventory.page.ts` | modificar | Extender el POM de forma aditiva: locators de orden, lectura de nombres/descripciones/precios, selección de criterio, estado de botón por ítem, badge y recarga. Conserva los métodos y locators actuales (retrocompatibilidad con 001/002). |
| `tests/inventory.spec.ts` | crear | Suite de casos TC-1 a TC-7 cubriendo RF-1 a RF-7. |
| `fixtures/test-fixtures.ts` | modificar | Exponer `inventoryPage` (ya inyectado) y mantener aislamiento por test; no requiere nuevas dependencias globales. |

## 4. Modelado de Datos y Selectores

Prioridad semántica/`data-test` conforme a constitución §4 y al patrón dominante del repo.

| Elemento | Selector / API |
|---|---|
| Grid de ítems | `page.locator('[data-test="inventory-item"]')` (reutiliza `inventoryItems`) |
| Nombre | `[data-test="inventory-item-name"]` |
| Descripción | `[data-test="inventory-item-desc"]` |
| Precio | `[data-test="inventory-item-price"]` |
| Acción por ítem | `button.btn_inventory` (agnóstico a "Add to cart"/"Remove") |
| Control de orden | `<select data-test="product-sort-container">` con valores `az`, `za`, `lohi`, `hilo` |
| Badge del carrito | `[data-test="shopping-cart-badge"]` |

- **Parseo de precio:** `/\$([0-9]+\.[0-9]{2})/` → `parseFloat`, mismo criterio que `CheckoutStepTwoPage.extractAmount`.
- **Modelado de producto:** `InventoryProduct` tipado con `price: number` (precio real, no string formateado).

## 5. Decisiones Técnicas y Alternativas Descartadas

1. **Comparación por secuencia completa:** el array del DOM se compara contra una copia ordenada con `.sort()` (determinista, sin alterar el AUT). Descartado validar solo extremos (no cubre RF-2..RF-5 al 100%).
2. **RF-6 (empates):** SauceDemo tiene un empate de precio real de `$15.99` ("Sauce Labs Bolt T-Shirt" y "Test.allTheThings() T-Shirt (Red)"). Se valida **determinismo** aplicando el mismo criterio dos veces y exigiendo secuencia idéntica, en lugar de asumir un algoritmo de orden estable no contractual.
3. **Persistencia (RF-7):** encadenar las 4 opciones de orden verificando estado "Remove" y badge constante, y posterior `page.reload()`. Descartado navegar a `/cart.html` (fuera de alcance, solapa 002).
4. **Precondición de sesión:** `beforeEach` con login UI sobre `LoginPage`. Descartado `storageState`/`auth.setup.ts` por directriz de proteger el arnés compartido (evita tocar `playwright.config.ts`).
5. **Locators:** se mantiene el patrón `data-test` del repo, priorizando `getByTestId`/`getByRole` cuando exista un nodo accesible único.

## 6. Estrategia de Pruebas Playwright

| Caso | RF | Verificación determinista |
|---|---|---|
| TC-1 Integridad del catálogo | RF-1 | `toHaveCount(6)`; por ítem: nombre no vacío `toBeVisible`, descripción visible, precio matchea `$XX.YY`, botón `toBeEnabled`. |
| TC-2 Orden por defecto A-Z | RF-2 | nombres del DOM `toEqual` copia `.sort()` ascendente. |
| TC-3 Name Z-A | RF-3 | nombres `toEqual` copia `.sort().reverse()`. |
| TC-4 Price low→high | RF-4 | precios numéricos `toEqual` copia `sort((a,b)=>a-b)`. |
| TC-5 Price high→low | RF-5 | precios numéricos `toEqual` copia `sort((a,b)=>b-a)`. |
| TC-6 Estabilidad ante empates | RF-6 | aplicar `lohi` dos veces; secuencia de nombres idéntica; pareja `$15.99` presente. |
| TC-7 Persistencia de carrito | RF-7 | añadir ≥1 ítem; encadenar `az→za→lohi→hilo`; estado "Remove" y badge constante; `reload()` y revalidar. |
| (transversal) | RF-8 | `npm run lint:determinism` = 0 sleeps; esperas vía `expect` reactivo. |

**Comandos:** `npx playwright test tests/inventory.spec.ts --project=chromium` y `npm run lint:determinism`.

## 7. Matriz de Trazabilidad

| RF | Caso | Archivo |
|---|---|---|
| RF-1 | TC-1 | `tests/inventory.spec.ts` |
| RF-2 | TC-2 | `tests/inventory.spec.ts` |
| RF-3 | TC-3 | `tests/inventory.spec.ts` |
| RF-4 | TC-4 | `tests/inventory.spec.ts` |
| RF-5 | TC-5 | `tests/inventory.spec.ts` |
| RF-6 | TC-6 | `tests/inventory.spec.ts` |
| RF-7 | TC-7 | `tests/inventory.spec.ts` |
| RF-8 | Gate | `npm run lint:determinism` |

## 8. Aislamiento y Gestión de Estado

- Cada test abre su propio contexto/página y autentica en `beforeEach`; sin estado compartido ni dependencia de orden de ejecución (constitución §2).
- Sin `storageState` compartido ni caché de sesión.
- Datos fijos y explícitos (`standard_user` / `secret_sauce`).
- Cleanup implícito: Playwright cierra la página/contexto al finalizar.

## 9. Convenciones

- `strict: true`, sin `any`; tipos explícitos y `Locator` de `@playwright/test`.
- Archivos `*.page.ts`, `*.spec.ts`, `*.types.ts`.
- Prohibido `waitForTimeout`/`sleep`; sincronización solo por estado observable.

## 10. Riesgos y Supuestos

| Ítem | Riesgo | Mitigación |
|---|---|---|
| Control de orden | El `<select>` puede no tener nombre accesible | `getByTestId('product-sort-container')` documentado. |
| RF-6 empates | Semántica de estabilidad no contractual | Validar determinismo (dos pasadas idénticas), no algoritmo. |
| Badge tras `reload` | Persistencia depende del contexto del browser | Mantener mismo `page`/contexto dentro del test. |
| Cambios a `inventory.page.ts` | No romper 001/002 | Cambios aditivos; conservar locators/métodos actuales. |

## 11. Checklist de Validación

- [ ] `types/inventory.types.ts` con constantes y tipos tipados (sin `any`).
- [ ] `InventoryPage` extendido con lectura, orden, estado de botón y badge.
- [ ] `tests/inventory.spec.ts` cubriendo RF-1 a RF-7.
- [ ] Matriz RF → test 1:1 verificada.
- [ ] `lint:determinism` limpio (0 sleeps).
- [ ] Suite completa `npm run test:all` en verde en Chromium.

## 12. Referencias

- `specs/003-inventory-saucedemo/spec.md`
- `docs/constitution.md`
- `pages/inventory.page.ts`, `pages/login.page.ts`, `fixtures/test-fixtures.ts`
