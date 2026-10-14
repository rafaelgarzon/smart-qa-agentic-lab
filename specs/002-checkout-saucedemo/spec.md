# Spec 002: Flujo Completo de Catálogo, Carrito y Checkout en SauceDemo

Estado: aprobada

## 1. Contexto y Alcance
Esta especificación define el comportamiento E2E del embudo de compra en SauceDemo, desde la selección de artículos en el catálogo hasta la confirmación de la orden final.

## 2. Requisitos Funcionales (Sintaxis EARS)

### RF-1: Selección de producto e incremento de contador de carrito
- **Cuándo** el usuario autenticado agrega un producto desde el catálogo de inventario.
- **El SISTEMA debe** alternar la acción del ítem a "Remove" e incrementar el contador visual del carrito reflejando el número exacto de ítems seleccionados.

### RF-2: Navegación y consistencia del catálogo en el carrito
- **Cuándo** el usuario accede a la vista del carrito de compras.
- **El SISTEMA debe** desplegar los productos previamente seleccionados preservando su nombre, descripción y precio unitario, junto a la acción interactiva de "Checkout".

### RF-3: Validación de datos de envío en Checkout Paso Uno
- **Dado que** el usuario se encuentra en la pantalla de información del cliente.
- **Si** el usuario intenta continuar con campos obligatorios vacíos (First Name, Last Name o Postal Code).
- **El SISTEMA debe** bloquear la navegación y desplegar el mensaje de error de validación accesible correspondiente.
- **Cuándo** el usuario diligencia datos de envío válidos y confirma la acción.
- **El SISTEMA debe** redirigir a la pantalla de resumen y confirmación de orden.

### RF-4: Integridad de resumen de pago y cálculo de totales en Checkout Paso Dos
- **Dado que** el usuario se encuentra en la pantalla de resumen de compra.
- **El SISTEMA debe** presentar la información de pago, método de envío, subtotal de ítems e impuesto, y verificar que la suma aritmética de subtotal e impuesto sea exactamente igual al total final facturado.

### RF-5: Confirmación de orden completada
- **Cuándo** el usuario confirma la compra en la pantalla de resumen.
- **El SISTEMA debe** navegar a la pantalla de confirmación, renderizar el encabezado con el mensaje accesible "Thank you for your order!" y disponer de la acción para retornar al inventario.

### RF-6: Determinismo y Gobernanza Técnica (Transversal)
- **El SISTEMA debe** garantizar cero llamadas a `waitForTimeout` o pausas arbitrarias. Toda validación debe basarse en estados reactivos del DOM y aserciones auto-reintentables.
