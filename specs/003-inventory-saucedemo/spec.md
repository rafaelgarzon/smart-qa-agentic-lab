# Spec 003 — Inventario SauceDemo

Estado: aprobada

## Contexto y Objetivo
Automatizar y certificar el comportamiento contractual del catálogo de productos de SauceDemo (`/inventory.html`). La suite garantiza la integridad visual de los ítems, las cuatro variantes de ordenamiento y la persistencia del estado del carrito ante reordenamientos y recargas.

## Definiciones
- **Ítem / Producto:** Cada elemento individual expuesto en el grid de inventario (`.inventory_item`). Cardinalidad fija: 6 productos.
- **Precio Numérico:** Valor flotante positivo obtenido tras remover el prefijo monetario `$` (p. ej., `$29.99` -> `29.99`).
- **Estado de Botón:** Alternancia determinista entre "Add to cart" (no seleccionado) y "Remove" (seleccionado en carrito).

## Precondición
- El actor cuenta con sesión autenticada activa (suministrada vía fixture/storageState desacoplado de `001-login-saucedemo`).
- Ubicación inicial en `https://www.saucedemo.com/inventory.html`.

## Fuera de Alcance
- Formulario de login y manejo de credenciales inválidas (cubierto en spec 001).
- Flujo de checkout, resumen de compra y confirmación de orden (cubierto en spec 002).

## Historias de Usuario
- **HU-1:** Como usuario autenticado, quiero ver el catálogo completo de 6 productos con datos consistentes para evaluar mis compras.
- **HU-2:** Como usuario autenticado, quiero ordenar los productos por nombre y precio en ambos sentidos para localizarlos eficientemente.
- **HU-3:** Como usuario autenticado, quiero que los productos añadidos y el contador del carrito se preserven al reordenar o recargar la vista.

## Requisitos Funcionales (EARS en español)
- **RF-1:** CUANDO carga la página de inventario, EL SISTEMA muestra exactamente 6 productos en el catálogo, cada uno conteniendo nombre visible no vacío, descripción textual, precio formateado (`$XX.YY`) y botón de acción interactivo.
- **RF-2:** CUANDO el usuario no ha seleccionado ningún filtro, EL SISTEMA presenta por defecto el catálogo ordenado alfabéticamente ascendente "Name (A to Z)".
- **RF-3:** CUANDO el usuario selecciona el criterio "Name (Z to A)", EL SISTEMA reordena los 6 productos de forma alfabética descendente.
- **RF-4:** CUANDO el usuario selecciona el criterio "Price (low to high)", EL SISTEMA reordena los 6 productos de forma numérica ascendente según su precio real.
- **RF-5:** CUANDO el usuario selecciona el criterio "Price (high to low)", EL SISTEMA reordena los 6 productos de forma numérica descendente según su precio real.
- **RF-6:** MIENTRAS existan productos con precios idénticos durante un ordenamiento numérico, EL SISTEMA mantiene un orden secundario determinista y estable basado en la posición original.
- **RF-7:** CUANDO el usuario añade uno o más ítems al carrito y cambia consecutivamente entre los 4 criterios de ordenación o recarga la página, EL SISTEMA preserva los botones en estado "Remove" para los ítems seleccionados y el contador visible en el badge del carrito sin decrementos involuntarios.
- **RF-8:** EL SISTEMA mantiene aserciones deterministas de estado reactivas (`toBeVisible()`, `toHaveText()`, `toHaveCount()`) y prohíbe taxativamente esperas estáticas (`waitForTimeout` o sleeps).

## Casos Límite Contemplados
- Encadenamiento secuencial de los 4 filtros de ordenación sin pérdida de estado reactivo.
- Persistencia de selección de productos con precios idénticos tras reordenar.
- Persistencia del badge del carrito tras recarga forzada del navegador en la vista del catálogo.

## Criterios de Finalización
- 100% de los requisitos RF-1 a RF-8 cubiertos por pruebas Playwright en TypeScript.
- Matriz de trazabilidad RF -> Test formalizada en el plan técnico.
- Ejecución limpia en Chromium con 0 sleeps (`lint:determinism` verificado).
