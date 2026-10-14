# Spec 002: Flujo Completo de Catálogo, Carrito y Checkout en SauceDemo

## 1. Contexto y Alcance
Esta especificación define el comportamiento E2E del embudo transaccional de compra en SauceDemo, partiendo del catálogo de productos autenticado hasta la pantalla final de orden completada.

## 2. Requisitos Funcionales (Sintaxis EARS)

### RF-1: Selección de producto e incremento de badge en inventario
- **Cuándo** el usuario autenticado hace clic en el botón "Add to cart" de un producto del catálogo (`/inventory.html`).
- **El SISTEMA debe** cambiar el texto del botón a "Remove" y actualizar el contador visual (`.shopping_cart_badge`) reflejando el número exacto de ítems seleccionados.

### RF-2: Navegación y consistencia del carrito
- **Cuándo** el usuario hace clic en el enlace del carrito (`.shopping_cart_link`).
- **El SISTEMA debe** redirigir a `/cart.html`, desplegar el listado de productos seleccionados con título, descripción y precio coincidente, y mostrar el botón interactivo "Checkout".

### RF-3: Validación de datos de envío en Checkout Paso Uno
- **Dado que** el usuario se encuentra en `/checkout-step-one.html`.
- **Si** el usuario intenta continuar con campos en blanco.
- **El SISTEMA debe** bloquear la navegación y desplegar el mensaje de error de validación correspondiente en el contenedor accesible.
- **Cuándo** el usuario ingresa *First Name*, *Last Name* y *Postal Code* válidos y hace clic en "Continue".
- **El SISTEMA debe** redirigir a `/checkout-step-two.html`.

### RF-4: Integridad de resumen de pago y cálculo en Checkout Paso Dos
- **Dado que** el usuario se encuentra en `/checkout-step-two.html`.
- **El SISTEMA debe** renderizar la información de pago, método de envío, desglose de subtotal (`Item total: $`), impuesto (`Tax: $`) y validar que la suma coincida aritméticamente con el Total final (`Total: $`).

### RF-5: Confirmación de orden completada
- **Cuándo** el usuario hace clic en el botón "Finish" en el resumen de orden.
- **El SISTEMA debe** redirigir a `/checkout-complete.html`, renderizar el encabezado accesible con el mensaje `"Thank you for your order!"` y habilitar el botón "Back Home" que retorna a `/inventory.html`.

### RF-6: Determinismo y Gobernanza Técnica (Transversal)
- **El SISTEMA debe** garantizar cero llamadas a `page.waitForTimeout()` o pausas estáticas. Toda aserción debe ser auto-reintentable (`toHaveText`, `toBeVisible`, `toHaveURL`).
