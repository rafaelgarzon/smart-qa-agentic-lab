# MEMORY - Smart QA Agentic Lab

## Estado del Repositorio
- Fecha de cierre: 2026-10-10
- Rama activa: `main` (sincronizada con GitHub).
- Metodología: Spec-Driven Development (SDD) con arnés agéntico y control HitL.

## Especificaciones Consolidadas
- `specs/001-login-saucedemo`: 100% cerrada (RF-1 a RF-6 cubiertos, 5/5 passed en Chromium).
  - RF-1: Login válido y redirección a catálogo (`/inventory.html`).
  - RF-2: Validación de catálogo con al menos 1 ítem visible y botón activo.
  - RF-3: Credenciales erróneas con aserción de mensaje tipado exacto.
  - RF-4: Requisito transversal de determinismo (cero `waitForTimeout` forzado por script).
  - RF-5: Campos vacíos con validación de texto exacto (`LOGIN_ERROR_MESSAGES.emptyFields`).
  - RF-6: Usuario bloqueado con validación de texto exacto (`LOGIN_ERROR_MESSAGES.lockedOutUser`).

## Capacidades Agénticas Calibradas (RCA)
- `docs/rca/fault-injection-key.md`:
  - `FAULT-01`: `SELECTOR_DESFASADO` (100% precisión, propuesta diff respetando aserciones).
  - `FAULT-02`: `BUG_PRODUCTO` (100% precisión, discrepancia de contenido funcional).
- Comandos operativos: `/triage`, `/repair`, `/sdd-status`.

## Próximo Objetivo
- Iniciar `specs/002-checkout-saucedemo` (Catálogo, carrito y orden de compra).
