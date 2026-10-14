# Spec 005 — Ordenamiento Algorítmico del Catálogo SauceDemo

Estado: aprobada

## Contexto y Objetivo
Certificar la **lógica algorítmica interna** del ordenamiento del catálogo de SauceDemo (`/inventory.html`) mediante el control único `[data-test="product-sort-container"]`. A diferencia de la spec 003 —que valida la UI elemental (presencia de ítems y orden observado de los cuatro criterios)—, la spec 005 **no re-testea esa UI**: audita la **monotonicidad matemática de los datos**, la invariante de **desempate determinista** ante precios iguales y la invariante de **reset** del criterio en navegación cruzada. Las propiedades se verifican contra un **oráculo independiente** (transformación determinista de una lista dorada fija), nunca contra el propio DOM.

> Nota de alcance: SauceDemo **no expone funcionalidad de filtrado** (`filter`). El único control de orden es el `<select data-test="product-sort-container">` con los valores `az`, `za`, `lohi` y `hilo`.

## Definiciones
- **Ítem / Producto:** Cada elemento renderizado en el grid (`[data-test="inventory-item"]`). Cardinalidad estricta: 6 productos.
- **Lista dorada (golden dataset):** Corpus fijo de 6 productos (nombre + precio), fuente del oráculo. **No** se lee del DOM.

  | Nombre | Precio |
  |---|---|
  | Sauce Labs Backpack | 29.99 |
  | Sauce Labs Bike Light | 9.99 |
  | Sauce Labs Bolt T-Shirt | 15.99 |
  | Sauce Labs Fleece Jacket | 49.99 |
  | Sauce Labs Onesie | 7.99 |
  | Test.allTheThings() T-Shirt (Red) | 15.99 |

- **Criterio por defecto:** `Name (A to Z)`, valor de control `az`.
- **Oráculo léxico (independiente del DOM):** Transformación determinista de la **lista dorada** mediante `Array.prototype.sort()` con colación `localeCompare(otro, 'en', { sensitivity: 'variant' })`. Para A-Z se usa el comparador ascendente; para Z-A, el comparador descendente (comparador invertido). El locale `'en'` y la opción `sensitivity: 'variant'` están **pinned** para garantizar el mismo resultado entre máquinas y CI.
- **Oráculo numérico (independiente del DOM):** Transformación determinista de la lista dorada por precio con desempate alfabético explícito:
  - low→high: `(a, b) => (a.precio - b.precio) || a.nombre.localeCompare(b.nombre, 'en', { sensitivity: 'variant' })`.
  - high→low: `(a, b) => (b.precio - a.precio) || a.nombre.localeCompare(b.nombre, 'en', { sensitivity: 'variant' })`.
- **Precio Numérico:** Valor flotante obtenido por parseo exacto del texto con la expresión anclada `^\$(\d+\.\d{2})$` seguido de `parseFloat`. Comparación por **igualdad numérica estricta** (`===`), sin tolerancia epsilon.
- **Monotonicidad:** Propiedad verificable de la secuencia del DOM: precios no decrecientes (ascendente) o no crecientes (descendente); nombres no decrecientes (A-Z) o no crecientes (Z-A) bajo la colación fijada.
- **Invariante de desempate:** Ante dos o más ítems con el mismo precio, el orden relativo se resuelve alfabéticamente ascendente (A-Z), de forma **independiente del criterio seleccionado previamente**.
- **Navegación cruzada (delimitada taxativamente a dos flujos):**
  1. **Flujo A — roundtrip a carrito:** salir de `/inventory.html` a `/cart.html` y regresar mediante clic en `Continue Shopping` (`[data-test="continue-shopping"]`).
  2. **Flujo B — roundtrip a detalle:** clic en el nombre "Sauce Labs Backpack" hacia la vista de detalle (`/inventory-item.html`) y regreso mediante el botón `Back to products`.
- **Asentamiento reactivo:** Antes de serializar datos del DOM, esperar reactivamente a que el **primer ítem** del grid coincida con el **primer elemento esperado** del oráculo del criterio recién aplicado.

## Precondición
- El actor cuenta con sesión autenticada activa (`standard_user`), suministrada mediante login por UI en `beforeEach` (patrón vigente en `tests/checkout.spec.ts`); desacoplada de `001-login-saucedemo`.
- Ubicación inicial en `https://www.saucedemo.com/inventory.html`.

## Fuera de Alcance
- Funcionalidad de **filtrado** (`filter`): no existe en el AUT; no se especifica ni se simula.
- **UI elemental de 003:** presencia/integridad de ítems (nombre, descripción, precio, acción habilitada) y verificación observacional simple de los cuatro criterios. 005 **audita solo la lógica algorítmica y la invariante de reset**; la frontera es "monotonicidad y desempate sobre oráculo", no "el orden coincide con el AUT".
- Carrito, checkout y confirmación de orden salvo la mecánica de navegación de los dos flujos cruzados definidos (cubiertos por specs 002 y 004).
- Autenticación y manejo de credenciales (cubierto por spec 001).
- Persistencia real del criterio seleccionado: el AUT no la implementa; la spec 005 exige el **reset** (ver RF-6).

## Historias de Usuario
- **HU-1:** Como usuario autenticado, quiero que el orden alfabético sea léxicamente correcto y monótono respecto de una referencia fija, para localizar productos por nombre sin ambigüedad.
- **HU-2:** Como usuario autenticado, quiero que el orden por precio sea numéricamente exacto y monótono, con empates resueltos siempre igual, para comparar productos de forma confiable.
- **HU-3:** Como usuario autenticado, quiero que al ir al carrito o al detalle y volver (o recargar), el catálogo me muestre siempre un estado base predecible (A-Z).

## Requisitos Funcionales (EARS en español)
- **RF-1:** CUANDO el usuario selecciona el criterio "Name (A to Z)" (`az`) o carga la vista con su valor por defecto, EL SISTEMA presenta los 6 nombres idénticos al **oráculo léxico A-Z** (derivado de la lista dorada fija) y la secuencia es monótona no decreciente bajo `localeCompare(..., 'en', { sensitivity: 'variant' })`.
- **RF-2:** CUANDO el usuario selecciona el criterio "Name (Z to A)" (`za`), EL SISTEMA presenta los 6 nombres idénticos al **oráculo léxico Z-A** (comparador descendente sobre la lista dorada) y la secuencia es monótona no creciente bajo la colación fijada.
- **RF-3:** CUANDO el usuario selecciona el criterio "Price (low to high)" (`lohi`), EL SISTEMA presenta los 6 precios idénticos al **oráculo numérico low→high** (igualdad numérica estricta) y la secuencia de precios es monótona no decreciente.
- **RF-4:** CUANDO el usuario selecciona el criterio "Price (high to low)" (`hilo`), EL SISTEMA presenta los 6 precios idénticos al **oráculo numérico high→low** (igualdad numérica estricta) y la secuencia de precios es monótona no creciente.
- **RF-5:** CUANDO un ordenamiento numérico (RF-3 o RF-4) produce precios iguales, EL SISTEMA resuelve el empate en orden alfabético ascendente estricto (A-Z), de forma determinista e independiente del criterio seleccionado previamente (en particular, `za → lohi` y `za → hilo` restablecen el empate a `Bolt` antes que `Test.allTheThings`).
- **RF-6:** CUANDO el usuario recarga `/inventory.html` o ejecuta cualquiera de los dos flujos de navegación cruzada (A: roundtrip a `/cart.html` y regreso vía `Continue Shopping`; B: roundtrip al detalle de "Sauce Labs Backpack" y regreso vía `Back to products`), EL SISTEMA restablece el criterio de orden al valor por defecto "Name (A to Z)" (`az`).
- **RF-7:** CUANDO el usuario cambia el criterio de orden, EL SISTEMA garantiza el asentamiento reactivo del grid: el arnés espera a que el primer ítem del DOM coincida con el primer elemento esperado del oráculo del criterio elegido **antes** de serializar nombres o precios (elimina carreras de re-render).
- **RF-8:** EL SISTEMA localiza el control de orden mediante `page.getByTestId('product-sort-container')` —requiere `testIdAttribute: 'data-test'` en el arnés— o, como alternativa equivalente, `page.locator('select.product_sort_container')`; y usa exclusivamente aserciones reactivas Playwright (`expect(locator).toHaveText()`, `toHaveValue()`, `toHaveCount()`) antes de serializar valores, con **0 esperas estáticas** (`waitForTimeout` o pausas arbitrarias).

## Casos Límite Contemplados
- Empate de precio real `$15.99` entre "Sauce Labs Bolt T-Shirt" y "Test.allTheThings() T-Shirt (Red)": el desempate es alfabético ascendente (`Bolt` antes que `Test.allTheThings`) en **ambos** criterios de precio, sin importar el criterio previo.
- Transición `za → lohi` y `za → hilo`: el empate **no** preserva el orden inverso previo; se restablece a A-Z (evidencia de que no hay ordenación estable clásica).
- Nombres con paréntesis y capitalización mixta ("Test.allTheThings() T-Shirt (Red)"): la colación se resuelve con el locale fijo `en` y `sensitivity: 'variant'`.
- Carrera de re-render: tras `selectOption`, el primer ítem del grid se usa como condición de asentamiento reactivo (RF-7) antes de cualquier lectura.
- Reset del criterio tras `reload` de `/inventory.html`, tras el Flujo A y tras el Flujo B.
- Monotonicidad estricta: se valida la relación de orden elemento a elemento, no solo los extremos de la lista.

## Decisiones de Clarificación (resueltas)
1. **Oráculo independiente.** El oráculo **no** es el DOM: es la transformación determinista de la lista dorada fija de 6 productos con `Array.prototype.sort()` + `localeCompare('en', { sensitivity: 'variant' })` (A-Z y Z-A), eliminando la circularidad detección original.
2. **Navegación cruzada delimitada.** Solo dos flujos: (A) roundtrip a `/cart.html` con regreso por `Continue Shopping`; (B) roundtrip al detalle de "Sauce Labs Backpack" con regreso por `Back to products`. Queda prohibida cualquier otra forma de retorno.
3. **Frontera con 003.** 005 audita la lógica algorítmica interna (desempate A-Z para `$15.99` entre Bolt T-Shirt y Test.allTheThings) y el reset invariante del AUT; **no** re-testa la UI elemental de 003, sino que valida monotonicidad matemática de datos contra el oráculo.
4. **Asentamiento del re-render.** Ante cada cambio de `<select>`, se espera reactivamente a que el primer ítem del DOM coincida con el primer elemento esperado del criterio elegido antes de extraer datos.
5. **Persistencia → reset.** Verificado empíricamente en el AUT: `default=az`, `tras za=za`, `tras reload=az`, `tras roundtrip a /cart.html=az`, `tras volver del detalle=az`. El AUT **no** persiste; la spec exige el reset (RF-6).
6. **Empates.** El AUT **no** usa ordenación estable: `za → lohi` invierte el empate a A-Z. La invariante exigida es el desempate alfabético ascendente determinista (RF-5).
7. **Precio.** Parseo exacto anclado `^\$(\d+\.\d{2})$` + `parseFloat`; comparación por igualdad numérica estricta, sin epsilon.
8. **Guardarraíles constitucionales.** Localizadores semánticos (`getByTestId('product-sort-container')` o `locator('select.product_sort_container')`) y 0 sleeps con aserciones reactivas antes de serializar (RF-8).

## Criterios de Finalización
- 100% de los requisitos RF-1 a RF-8 cubiertos por pruebas Playwright en TypeScript.
- Matriz de trazabilidad RF → Test formalizada en el plan técnico, mapeando cada RF a su **propiedad algorítmica** (monotonicidad / desempate / reset) y sin re-testear la UI elemental de la spec 003.
- Ejecución limpia en Chromium con 0 sleeps (`npm run lint:determinism` verificado) y suite global `npm run test:all` en verde.
- Aprobación humana explícita registrada (Human-in-the-Loop): estado transicionado a `aprobada` el 2026-10-14.
