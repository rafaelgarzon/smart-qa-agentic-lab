# Demo de /repair con FAULT-05 (2026-11-21)

> No es una medición: FAULT-05 ya está dentro de la muestra (motivó el reporter v2, ADR 003, y el ajuste de `/repair`). Sirve para comprobar el flujo Human-in-the-Loop de punta a punta, no para estimar la precisión de `/repair`.

Rama: `demo/repair-fault-05` · Commit de la reparación: `c9ec9e7`.

## Flujo

| Paso | Quién | Resultado |
| :--- | :--- | :--- |
| 1. Categoría de entrada (diagnóstico de `/triage` con reporter v2, ADR 003) | agente | `SELECTOR_DESFASADO` |
| 2. `/repair SELECTOR_DESFASADO` | agente | diff en `pages/cart.page.ts` |
| 3. `git apply --check` | persona | `PATCH OK` |
| 4. `git apply` + revisión de `git diff` | persona | 1 línea cambiada, solo en `pages/` |
| 5. `npm run test:faults -- --project=chromium-05` | persona | pasa con el DOM alterado |
| 6. `npm run test:all` | persona | pasa con el DOM real |
| 7. Commit | persona | `c9ec9e7` |

## Diff propuesto y aplicado

```diff
-    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
+    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
```

- Coincide con la reparación esperada en `blind-key.md`.
- Usa la prioridad más alta de la §4 de la constitución (rol accesible), así que sobrevive tanto al `data-test` inyectado (`back-to-shopping`) como al original.

## Guardarraíles comprobados
- Ningún `expect` modificado.
- Sin `waitForTimeout` ni pausas estáticas.
- Sin cambios fuera de `pages/*.page.ts`.
- El agente no aplicó el diff: lo aplicó la persona después de `git apply --check`.

## Consecuencia para el dataset
Con la reparación aplicada, FAULT-05 deja de fallar. Por eso el commit se queda en `demo/repair-fault-05` y no se fusiona en `main`, para que el caso sembrado siga disponible.

## Pendiente
Medir `/repair` sobre un lote ciego (FAULT-10 en adelante) con varios `SELECTOR_DESFASADO`, con 3 corridas por fallo.
