# MEMORY - Smart QA Agentic Lab

## Estado actual
- Fecha: 2026-10-22 · Rama: `main` (spec 006 integrada; ramas `feature/*` y `fault-injection*` ya históricas).
- Specs cerradas al 100% (detalle en `specs/`):
  - 001 login: 5 tests · 002 checkout: 3 · 003 inventory: 7
  - 004 cart: 10 · 005 sort: 8 · 006 session-logout: 10
- `npm run test:all`: 43 passed en Chromium. `npm run lint:determinism`: 0 `waitForTimeout`.
- Calibración RCA (`tests/faults/`, `docs/rca/fault-injection-key.md`):
  - FAULT-01 `SELECTOR_DESFASADO` (100% de precisión).
  - FAULT-02 `BUG_PRODUCTO` (100% de precisión).
  - FAULT-03 `DATOS_O_ENTORNO` (interrupción de red sembrada).
- Claude Code integrado (commits 58e3905..60f8fc8): `CLAUDE.md` importa AGENTS.md y MEMORY.md, MCP, modo plan y hook `guard-assertions`.

## Decisiones clave
- SDD por carpeta `specs/NNN-*/` (spec → plan → tasks). Cada spec se cierra con `lint:determinism` y `test:all` en verde.
- POM extendidos de forma aditiva y retrocompatible: `pages/inventory.page.ts` es compartido por las specs 003, 005 y 006.
- Los oráculos (orden esperado, precios, mensajes) son funciones puras en `types/` y no se leen del DOM.
- "Menú abierto" = `aria-hidden="false"` AND Logout `toBeInViewport({ ratio: 1 })`.
- La sesión se verifica con `browserContext.cookies()` (`session-username`), no con el DOM.
- Se asevera el estado asentado tras navegar (URL raíz + inventario oculto), no la URL inmediata.
- `tests/faults/` queda fuera de `test:all` y tiene su propio config (`playwright.faults.config.ts`).
- AGENTS.md y MEMORY.md son la memoria compartida entre OpenCode y Claude Code.

## Errores a evitar
- `toBeVisible()` sobre el menú hamburguesa da falso positivo (el menú está fuera de pantalla pero cuenta como visible).
- `#inventory_container` está duplicado en el DOM y rompe el strict mode: usar `[data-test="inventory-container"]`.
- Leer el primer ítem justo después de cambiar el orden puede devolver un valor viejo: esperar el re-render (`selectSortAndSettle`).
- Asumir que el logout limpia `localStorage`: la analítica `backtrace-*` persiste (non-goal).
- Usar CSS cuando existe rol o `data-test` (`.bm-menu-wrap` es la única excepción justificada).
- Editar fallos sembrados o "arreglar" un test tocando su `expect`.
- Guardar contexto importante solo en la auto-memoria de Claude Code (OpenCode no la ve).

## Pendientes y observaciones
- Cada herramienta usa un MCP de Playwright distinto: `@playwright/mcp` en `.mcp.json` y `@executeautomation/playwright-mcp-server` en `opencode.json`.
- `/triage` tiene fija la spec `specs/001-login-saucedemo/spec.md`; para fallos de otras specs, indicar la spec correspondiente.
