# Spec 003 — Inventario SauceDemo

Estado: aprobada

## Contexto y Objetivo
Automatizar y certificar el comportamiento contractual del catálogo de productos de SauceDemo (`/inventory.html`). La suite garantiza la integridad visual de los ítems, las cuatro modalidades de ordenamiento y la persistencia del estado del carrito ante reordenamientos y recargas.

## Definiciones
- **Ítem / Producto:** Cada elemento individual renderizado en el grid de inventario (`.inventory_item`). Cardinalidad estricta: 6 productos.
- **Precio Numérico:** Valor flotante positivo obtenido al remover el prefijo de divisa `$` (p. ej., `$29.99` -> `29.99`).
- **Estado de Botón:** Alternancia determinista entre "Add to cart" (estado inicial) y "Remove" (ítem seleccionado en carrito).

## Precondición
- El actor cuenta con sesión autenticada activa (suministrada vía fixture/storageState desacoplado de `001-login-saucedemo`).
- Ubicación inicial en `https://www.saucedemo.com/inventory.html`.

## Fuera de Alcance
- Formulario de autenticación y control de credenciales inválidas (cubierto en spec 001).
- Flujo de checkout, resumen de compra y confirmación de orden (cubierto en spec 002).

## Historias de Usuario
- **HU-1:** Como usuario autenticado, quiero visualizar los 6 productos del catálogo con sus datos completos para evaluar mis compras.
- **HU-2:** Como usuario autenticado, quiero ordenar los productos por nombre y precio en ambos sentidos para localizarlos eficientemente.
- **HU-3:** Como usuario autenticado, quiero que los productos añadidos y el contador del carrito se preserven al reordenar o recargar la vista.

## Requisitos Funcionales (EARS en español)
- **RF-1:** CUANDO carga la página de inventario, EL SISTEMA muestra exactamente 6 productos en el catálogo, cada uno conteniendo nombre visible no vacío, descripción textual, precio numérico formateado (`$XX.YY`) y botón interactivo habilitado.
- **RF-2:** CUANDO el usuario no ha seleccionado ningún filtro, EL SISTEMA presenta por defecto el catálogo ordenado alfabéticamente ascendente "Name (A to Z)".
- **RF-3:** CUANDO el usuario selecciona el criterio "Name (Z to A)", EL SISTEMA reordena los 6 productos de forma alfabética descendente.
- **RF-4:** CUANDO el usuario selecciona el criterio "Price (low to high)", EL SISTEMA reordena los 6 productos de forma numérica ascendente según su precio real.
- **RF-5:** CUANDO el usuario selecciona el criterio "Price (high to low)", EL SISTEMA reordena los 6 productos de forma numérica descendente según su precio real.
- **RF-6:** MIENTRAS existan productos con precios idénticos durante un ordenamiento numérico, EL SISTEMA mantiene un orden secundario determinista y estable preservando la consistencia de la secuencia en el DOM.
- **RF-7:** CUANDO el usuario añade uno o más ítems al carrito y cambia consecutivamente entre los criterios de ordenación o recarga la página, EL SISTEMA preserva el estado "Remove" en dichos ítems y conserva el contador del badge sin decrementos involuntarios.
- **RF-8:** EL SISTEMA mantiene aserciones deterministas de estado reactivas (`toBeVisible()`, `toHaveText()`, `toHaveCount()`) y prohíbe taxativamente esperas estáticas (`waitForTimeout` o pausas arbitrarias).

## Casos Límite Contemplados
- Encadenamiento secuencial de las 4 opciones de ordenamiento sin desincronización reactiva del DOM.
- Estabilidad de visualización ante empates de precios repetidos en catálogo.
- Persistencia del badge del carrito y estado de botones tras recarga forzada (`reload`) en la vista del catálogo.

## Criterios de Finalización
- 100% de los requisitos RF-1 a RF-8 cubiertos por pruebas Playwright en TypeScript.
- Matriz de trazabilidad RF -> Test formalizada en el plan técnico.
- Ejecución limpia en Chromium con 0 sleeps (`lint:determinism` verificado).
