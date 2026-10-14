# Plan Técnico: Spec 002 - Flujo E2E de Compra SauceDemo

## 1. Arquitectura de Page Objects
Se extiende el arnés con 4 Page Objects modulares bajo `pages/`:
- `pages/cart.page.ts`: Inspección de ítems en carrito, botón de checkout y navegación.
- `pages/checkout-step-one.page.ts`: Formulario de envío (firstName, lastName, postalCode) y mensajes de error.
- `pages/checkout-step-two.page.ts`: Extracción y parseo numérico de subtotal, tax y total; acción finish.
- `pages/checkout-complete.page.ts`: Validación de encabezado de agradecimiento y retorno a inventario.

## 2. Manejo Numérico y Aritmética Determinista (RF-4)
- Método utilitario en `CheckoutStepTwoPage` para extraer valores monetarios con regex `/\$([0-9]+\.[0-9]{2})/`.
- Comparación aritmética con redondeo de seguridad a dos decimales (`Math.round((itemTotal + tax) * 100) / 100 === total`) para evitar discrepancias de punto flotante de JavaScript sin relajar la aserción.

## 3. Fixtures Centralizados
- Actualizar `fixtures/test-fixtures.ts` para inyectar automáticamente `cartPage`, `checkoutStepOnePage`, `checkoutStepTwoPage` y `checkoutCompletePage`.

## 4. Checklist de Validación (§10)
- [ ] CartPage implementado y tipado
- [ ] CheckoutStepOnePage implementado con validación de errores
- [ ] CheckoutStepTwoPage implementado con parseo numérico determinista
- [ ] CheckoutCompletePage implementado con verificación de encabezado
- [ ] Test E2E `tests/checkout.spec.ts` cubriendo RF-1 a RF-6
- [ ] Cero `waitForTimeout` verificado con `npm run lint:determinism`
- [ ] Suite completa en verde en Chromium
