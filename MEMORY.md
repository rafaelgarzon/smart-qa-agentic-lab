# MEMORY - Smart QA Agentic Lab

## Estado del Repositorio
- Fecha: 2026-10-14
- Rama: `feature/002-checkout-saucedemo` (en proceso de merge a `main`).
- Metodología: Spec-Driven Development (SDD) con arnés agéntico y control HitL.

## Especificaciones Consolidadas
- `specs/001-login-saucedemo`: 100% cerrada (RF-1 a RF-6 cubiertos, 5/5 passed en Chromium).
- `specs/002-checkout-saucedemo`: 100% cerrada (RF-1 a RF-6 cubiertos, 3/3 passed en Chromium).
  - RF-1: Selección de producto, alternancia de botón a Remove e incremento de badge en catálogo.
  - RF-2: Navegación a `/cart.html` y verificación de consistencia de ítems.
  - RF-3: Manejo de errores de validación en `/checkout-step-one.html` y avance exitoso.
  - RF-4: Comprobación aritmética determinista de totales (`Item total + Tax === Total`) en `/checkout-step-two.html`.
  - RF-5: Confirmación de orden en `/checkout-complete.html` con mensaje canónico y retorno a catálogo.
  - RF-6: Determinismo transversal verificado (0 pausas estáticas, script `lint:determinism` limpio).

## Suite de Regresión Global
- `npm run test:all`: 8 passed en Chromium (< 4s).
- `npm run lint:determinism`: 0 pausas fijas en el código.

## Capacidades de Calibración RCA
- `FAULT-01`: `SELECTOR_DESFASADO` (100% de precisión).
- `FAULT-02`: `BUG_PRODUCTO` (100% de precisión).
