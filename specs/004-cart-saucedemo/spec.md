# Spec 004 — Gestión del Carrito SauceDemo

Estado: borrador

## Contexto y Objetivo
Automatizar y certificar el comportamiento contractual de la vista de carrito de SauceDemo (`/cart.html`), con foco exclusivo en la **gestión del carrito**: la eliminación de ítems, el decremento sincronizado del badge, el estado de carrito vacío y el retorno al catálogo mediante "Continue Shopping". La suite garantiza la trazabilidad del contenido del carrito y su consistencia con la vista de inventario, sin solaparse con la navegación base ni la consistencia de ítems ya cubiertas por la spec 002.

## Definiciones
- **Vista de Carrito:** Página `https://www.saucedemo.com/cart.html` que lista los ítems previamente seleccionados.
- **Ítem de Carrito:** Cada fila renderizada en la lista del carrito (`cart_item`), compuesta por las columnas **QTY**, **Description**, **Name** (nombre + descripción) y **Price**.
- **Cantidad (QTY):** Valor de la columna de cantidad por ítem. Para SauceDemo es invariante e igual a `1` (no admite incrementos de cantidad).
- **Badge del Carrito:** Indicador visual superpuesto al ícono del carrito (`.shopping_cart_badge`) que refleja el número entero de ítems seleccionados.
- **Acción "Remove":** Botón por ítem que excluye el producto del carrito y ajusta el estado global.
- **Precio Numérico:** Valor flotante positivo obtenido al remover el prefijo de divisa `$` (p. ej., `$29.99` -> `29.99`).

## Precondición
- El actor cuenta con sesión autenticada activa (suministrada vía fixture/storageState desacoplado de `001-login-saucedemo`).
- Existe al menos un ítem previamente añadido al carrito, salvo en los casos de acceso directo a la vista con carrito vacío.

## Fuera de Alcance
- Formulario de autenticación y control de credenciales inválidas (cubierto en spec 001).
- Navegación al carrito, despliegue base y consistencia de ítems previamente seleccionados (cubierto en spec 002).
- Flujo de checkout, informacion de envío, resumen de compra y confirmación de orden (cubierto en spec 002). Solo se verifica la presencia/habilitación del botón "Checkout" como punto de salida, sin ejercer su flujo.
- Catálogo, ordenamiento y persistencia de inventario (cubierto en spec 003).

## Historias de Usuario
- **HU-1:** Como usuario autenticado, quiero visualizar los ítems del carrito con su cantidad, datos y precio para confirmar mi selección antes de comprar.
- **HU-2:** Como usuario autenticado, quiero eliminar ítems del carrito y ver actualizado el contador en tiempo real para ajustar mi compra.
- **HU-3:** Como usuario autenticado, quiero que al vaciar el carrito el estado se refleje limpiamente y que al volver al catálogo las acciones queden restauradas.

## Requisitos Funcionales (EARS en español)
- **RF-1:** CUANDO el usuario accede a la vista del carrito con ítems seleccionados, EL SISTEMA muestra cada ítem con las columnas QTY, nombre visible no vacío, descripción textual, precio numérico formateado (`$XX.YY`) y botón "Remove" habilitado.
- **RF-2:** MIENTRAS el usuario visualiza la vista del carrito, EL SISTEMA muestra en la columna QTY el valor invariante `1` para cada ítem, sin admitir cantidades repetidas.
- **RF-3:** CUANDO el usuario pulsa "Remove" sobre un ítem del carrito, EL SISTEMA excluye dicho ítem de la lista y decrementa el badge del carrito exactamente en una unidad.
- **RF-4:** CUANDO el usuario elimina el último ítem del carrito, EL SISTEMA deja la lista sin ningún ítem y oculta por completo el badge del carrito (no renderiza el valor `0`).
- **RF-5:** CUANDO el usuario pulsa "Continue Shopping" con ítems restantes, EL SISTEMA navega de vuelta a `/inventory.html` preservando intacto el badge con el número exacto de ítems que permanecen en el carrito.
- **RF-6:** CUANDO el usuario elimina uno o más ítems y recarga la vista del carrito, EL SISTEMA conserva en el carrito exactamente los ítems restantes y el badge correspondiente, sin resucitar ítems eliminados.
- **RF-7:** SI el usuario accede directamente a `/cart.html` con sesión activa y sin ítems previos, ENTONCES EL SISTEMA presenta un carrito vacío válido (lista sin ítems y badge oculto) sin errores ni estados inconsistentes.
- **RF-8:** CUANDO el usuario elimina varios ítems en secuencia, EL SISTEMA mantiene el badge sincronizado con el conteo real en cada paso, sin desfases reactivos del DOM ni decrementos involuntarios.
- **RF-9:** CUANDO el usuario elimina un ítem desde el carrito y regresa a `/inventory.html`, EL SISTEMA muestra nuevamente ese producto con la acción inicial "Add to cart", reflejando su exclusión del carrito.
- **RF-10:** MIENTRAS el usuario elimina ítems, EL SISTEMA preserva inmutables los datos (nombre, descripción, precio y QTY) de los ítems no removidos.
- **RF-11:** EL SISTEMA mantiene aserciones deterministas de estado reactivas (`toBeVisible()`, `toHaveText()`, `toHaveCount()`) y prohíbe taxativamente esperas estáticas (`waitForTimeout` o pausas arbitrarias).

## Casos Límite Contemplados
- Vaciamiento total del carrito ítem por ítem hasta el estado vacío con ocultamiento del badge.
- Eliminación múltiple secuencial sin desincronización reactiva del badge.
- Persistencia del contenido restante y del badge tras recarga forzada (`reload`) de la vista del carrito.
- Acceso directo (deep-link) a `/cart.html` con sesión activa y carrito vacío.
- Restauración de la acción "Add to cart" en el catálogo tras eliminar un ítem del carrito.

## Criterios de Finalización
- 100% de los requisitos RF-1 a RF-11 cubiertos por pruebas Playwright en TypeScript.
- Matriz de trazabilidad RF -> Test formalizada en el plan técnico.
- Ejecución limpia en Chromium con 0 sleeps (`lint:determinism` verificado).
