# Plan Técnico: Spec 005 — Ordenamiento Algorítmico del Catálogo SauceDemo

**Especificación base:** `specs/005-sort-saucedemo/spec.md` (Estado: aprobada)
**Fecha:** 2026-10-14
**Idioma:** Español
**Equipo/Role:** Test Automation Lead Architect

---

## 1. Objetivo del Plan

Diseñar la arquitectura técnica para auditar la **lógica algorítmica** del ordenamiento (RF-1 a RF-8): colación léxica contra **oráculo independiente** con `localeCompare('en', { sensitivity: 'variant' })`, orden numérico flotante con parseo exacto, **desempate A-Z determinista** ante precios iguales, **reset invariante** en navegación cruzada y **asentamiento reactivo** del re-render. Se aplica Playwright + TypeScript con **POM aditivo**, oráculos puros y determinismo estricto conforme a `docs/constitution.md`.

## 2. Alcance y Precondición

- Vista bajo prueba: `https://www.saucedemo.com/inventory.html` con `standard_user`.
- **Precondición de sesión:** login por UI en `beforeEach` con `LoginPage` (patrón de `tests/checkout.spec.ts`), desacoplado de `001-login-saucedemo`.
- **Frontera con 003:** 005 valida propiedades algorítmicas y el reset invariante; **no** re-testa la UI elemental de 003.
- **Retrocompatibilidad total:** ninguna firma/locator existente de `InventoryPage` se elimina ni se altera; los cambios son estrictamente aditivos para no romper specs 002, 003 y 004.

## 3. Archivos POM y de Pruebas

| Archivo | Acción | Responsabilidad única |
|---|---|---|
| `types/sort.types.ts` | crear | Contratos tipados y **oráculos puros** (sin DOM): `SortOption = 'az' \| 'za' \| 'lohi' \| 'hilo'`, `GoldenProduct`, `GOLDEN_PRODUCTS` (lista dorada fija), comparador `localeCompareEn` y firmas/impl de oráculo `expectedNames(option)` / `expectedPrices(option)`. |
| `pages/inventory.page.ts` | modificar (aditivo) | Locator semántico del control de orden, lectura de valor del `<select>`, **selección con asentamiento reactivo** (RF-7) y helpers de navegación a detalle/regreso. Conserva todos los locators/métodos actuales. |
| `playwright.config.ts` | modificar (aditivo) | Añadir `testIdAttribute: 'data-test'` en `use` para habilitar `getByTestId('product-sort-container')` sin romper nada. Cambio no estructural y retrocompatible. |
| `tests/sort.spec.ts` | crear | Suite TC-1 a TC-8 cubriendo RF-1 a RF-8 con aserciones reactivas. |
| `fixtures/test-fixtures.ts` | sin cambios | `inventoryPage` y `cartPage` ya inyectados; el aislamiento por test ya está garantizado. |

## 4. Modelado de Datos y Selectores

### 4.1 Lista dorada / oráculo (en `types/sort.types.ts`, sin DOM)
```ts
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';
export interface GoldenProduct { name: string; price: number; }
export const GOLDEN_PRODUCTS: readonly GoldenProduct[];          // 6 ítems fijos
export const localeCompareEn: (a: string, b: string) => number;  // 'en', { sensitivity: 'variant' }
export function expectedNames(option: SortOption): string[];     // oráculo léxico / numérico con desempate A-Z
export function expectedPrices(option: SortOption): number[];    // oráculo numérico low/high
```
- `expectedNames('az' | 'za')`: nombres de `GOLDEN_PRODUCTS` ordenados con `localeCompareEn` ascendente/descendente.
- `expectedNames('lohi' | 'hilo')` y `expectedPrices(...)`: precio numérico con desempate `a.nombre.localeCompare(b.nombre, 'en', { sensitivity: 'variant' })`.

### 4.2 Selectores (prioridad semántica, constitución §4)
| Elemento | Selector / API |
|---|---|
| Control de orden | `page.getByTestId('product-sort-container')` (tras `testIdAttribute: 'data-test'`); fallback documentado `page.locator('select.product_sort_container')` |
| Primer nombre | `inventoryItems.first().locator('[data-test="inventory-item-name"]')` |
| Nombres / precios | `[data-test="inventory-item-name"]` / `[data-test="inventory-item-price"]` |
| Detalle (título) | `[data-test="inventory-item-name"]` dentro del ítem (ancla de navegación) |
| Regreso de detalle | `[data-test="back-to-products"]` |
| Regreso de carrito | `[data-test="continue-shopping"]` (`CartPage.continueShoppingButton`) |
| Badge | `[data-test="shopping-cart-badge"]` |

## 5. Decisiones Técnicas y Alternativas Descartadas

1. **Oráculo puro e independiente (RF-1..RF-4).** El oráculo se computa desde `GOLDEN_PRODUCTS` con `Array.prototype.sort()`; **descartado** derivar la expectativa del DOM (tautología detectada en clarificación).
2. **Colación fija.** `localeCompare('en', { sensitivity: 'variant' })` pinned. **Descartado** `localeCompare` sin locale (no determinista entre runners) y `.sort()` por code-unit (no documenta la intención léxica).
3. **Desempate A-Z (RF-5).** Se codifica como comparador secundario explícito `(a,b) => (a.precio - b.precio) || a.nombre.localeCompare(...)`. **Descartada** la estabilidad clásica: el AUT no es estable (`za → lohi` invierte Bolt/Test).
4. **Asentamiento reactivo (RF-7).** Método POM `selectSortAndSettle(option)` que, tras `selectOption`, espera `expect(firstNameLocator).toHaveText(expectedNames(option)[0])` **antes** de serializar. **Descartado** leer con `allInnerTexts()` inmediatamente tras `toHaveValue()` (carrera de re-render).
5. **Navegación cruzada delimitada (RF-6).** Solo Flujo A (`/cart.html` + `Continue Shopping`) y Flujo B (detalle + `Back to products`). **Descartado** `page.goBack()` y cualquier otro retorno.
6. **Guardarraíl de locator.** Se habilita `getByTestId` vía `testIdAttribute: 'data-test'` (aditivo). **Descartado** el selector de atributo crudo inline en el test; se mantiene como fallback documentado `select.product_sort_container`.
7. **Reset de carrito vs sort.** Tras Flujo A se revalida sólo el criterio (`az`); la persistencia del carrito/badge pertenece a 003/004 y no se re-testea.

## 6. Estrategia de Pruebas Playwright

| Caso | RF | Verificación determinista |
|---|---|---|
| TC-1 | RF-1 | `selectSortAndSettle('az')`; nombres `toEqual(expectedNames('az'))`; pares consecutivos monótonos no decrecientes con `localeCompareEn`. |
| TC-2 | RF-2 | `selectSortAndSettle('za')`; nombres `toEqual(expectedNames('za'))`; monótona no creciente. |
| TC-3 | RF-3 | `selectSortAndSettle('lohi')`; precios parseados (`^\$(\d+\.\d{2})$`) `toEqual(expectedPrices('lohi'))` con igualdad estricta; monótona no decreciente. |
| TC-4 | RF-4 | `selectSortAndSettle('hilo')`; precios `toEqual(expectedPrices('hilo'))`; monótona no creciente. |
| TC-5 | RF-5 | `selectSort('za')` → `selectSortAndSettle('lohi')`: par `$15.99` = `['Sauce Labs Bolt T-Shirt','Test.allTheThings() T-Shirt (Red)']`; repetir con `hilo`. |
| TC-6 | RF-6 | `selectSort('za')`; `reload()` → valor `az` + primer ítem `expectedNames('az')[0]`; repetir para Flujo A y Flujo B. |
| TC-7 | RF-7 | Para los 4 criterios: tras `selectOption`, el primer ítem del DOM coincide con `expectedNames(option)[0]` antes de serializar (sin lectura stale). |
| TC-8 | RF-8 | El control se localiza vía `getByTestId`/fallback POM; `npm run lint:determinism` = 0 sleeps; ausencia de serialización sin aserción previa (revisión estructural). |

**Comandos:** `npx playwright test tests/sort.spec.ts --project=chromium`, `npm run lint:determinism`, `npm run test:all`.

## 7. Matriz de Trazabilidad

| RF | Caso | Archivo | Propiedad auditada |
|---|---|---|---|
| RF-1 | TC-1 | `tests/sort.spec.ts` | Oráculo léxico A-Z + monotonicidad |
| RF-2 | TC-2 | `tests/sort.spec.ts` | Oráculo léxico Z-A + monotonicidad |
| RF-3 | TC-3 | `tests/sort.spec.ts` | Oráculo numérico low→high + monotonicidad |
| RF-4 | TC-4 | `tests/sort.spec.ts` | Oráculo numérico high→low + monotonicidad |
| RF-5 | TC-5 | `tests/sort.spec.ts` | Desempate A-Z determinista |
| RF-6 | TC-6 | `tests/sort.spec.ts` | Reset invariante (reload + 2 flujos) |
| RF-7 | TC-7 | `tests/sort.spec.ts` | Asentamiento reactivo del re-render |
| RF-8 | TC-8 | `tests/sort.spec.ts` + `lint:determinism` | Guardarraíles §3/§4 |

## 8. Aislamiento y Gestión de Estado

- Cada test abre su propio contexto/página y autentica en `beforeEach`; sin estado compartido (constitución §2).
- La lista dorada y los oráculos son **puros e inmutables** (sin I/O).
- Cleanup implícito: Playwright cierra página/contexto al finalizar.

## 9. Convenciones

- `strict: true`, sin `any`; tipos explícitos y `Locator` de `@playwright/test`.
- Archivos `*.page.ts`, `*.spec.ts`, `*.types.ts`.
- Prohibido `waitForTimeout`/`sleep`; sincronización solo por estado observable.

## 10. Riesgos y Supuestos

| Ítem | Riesgo | Mitigación |
|---|---|---|
| Colación `en` vs AUT | Divergencia si el AUT cambiara de names/punctuación | Oráculo pinned; datos dorados fijos; fallará explícitamente si cambia el corpus |
| `getByTestId` | Requiere `testIdAttribute` no presente hoy | Añadir `testIdAttribute: 'data-test'` (aditivo) + fallback `select.product_sort_container` |
| Flujo B (detalle) | Selector de regreso `back-to-products` | Esperar URL `/inventory.html` + `headerTitle` visible |
| Cambios a `inventory.page.ts` | Romper 001–004 | Cambios estrictamente aditivos; no tocar firmas existentes |
| RF-5 = 1 sola pareja de empate | Invariante acotada al corpus actual | Documentar `TIE_PRICE = 15.99`; el test falla si el corpus cambia |

## 11. Checklist de Validación

- [ ] `types/sort.types.ts` con `SortOption`, `GOLDEN_PRODUCTS` y oráculos puros (sin `any`).
- [ ] `inventory.page.ts` extendido (aditivo) con control semántico y `selectSortAndSettle`.
- [ ] `testIdAttribute: 'data-test'` añadido a `playwright.config.ts` (retrocompatible).
- [ ] `tests/sort.spec.ts` cubriendo RF-1 a RF-8 (TC-1 a TC-8).
- [ ] Matriz RF → test 1:1 verificada, sin re-testear UI elemental de 003.
- [ ] `lint:determinism` limpio (0 sleeps) y `npm run test:all` en verde (001..005).

## 12. Referencias

- `specs/005-sort-saucedemo/spec.md`
- `docs/constitution.md`
- `pages/inventory.page.ts`, `pages/cart.page.ts`, `types/inventory.types.ts`, `fixtures/test-fixtures.ts`
