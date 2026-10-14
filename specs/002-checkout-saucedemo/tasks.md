# Tareas: Spec 002 - Flujo E2E de Compra SauceDemo

Estado: completado

## Fase 0: Andamiaje y Modelado de Tipos (15 min)
- [x] T0.1: Definir interfaces y tipos para datos de envío en `types/checkout.types.ts`.

## Fase 1: Page Objects del Embudo (40 min)
- [x] T1.1: Implementar `pages/cart.page.ts` con localizadores accesibles de ítems y botón de checkout. [RF-2]
- [x] T1.2: Implementar `pages/checkout-step-one.page.ts` con inputs de envío y manejo de errores. [RF-3]
- [x] T1.3: Implementar `pages/checkout-step-two.page.ts` con extracción y parseo aritmético de subtotal/tax/total. [RF-4]
- [x] T1.4: Implementar `pages/checkout-complete.page.ts` con verificación de encabezado y retorno a inicio. [RF-5]
- [x] T1.5: Extender `pages/inventory.page.ts` para soportar adición de ítems y lectura de badge interactivo. [RF-1]
- [x] T1.6: Inyectar los 4 nuevos Page Objects en `fixtures/test-fixtures.ts`.

## Fase 2: Implementación de Pruebas E2E (45 min)
- [x] T2.1: Implementar pruebas de adición a carrito y consistencia en `tests/checkout.spec.ts`. [RF-1, RF-2]
- [x] T2.2: Implementar pruebas de validación de formulario de envío y avance a resumen. [RF-3]
- [x] T2.3: Implementar prueba de cálculo aritmético determinista de orden y finalización. [RF-4, RF-5]

## Fase 3: Quality Gate y Auditoría Final (15 min)
- [x] T3.1: Verificación estricta de cero pausas arbitrarias (`waitForTimeout`) y validación de determinismo. [RF-6]
- [x] T3.2: Ejecución de suite completa de regresión (`auth.spec.ts` + `checkout.spec.ts`).
