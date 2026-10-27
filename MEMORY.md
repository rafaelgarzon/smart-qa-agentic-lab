# MEMORY - Smart QA Agentic Lab

## Estado actual
- Fecha: 2026-10-23 · Rama: `main` (spec 006 integrada; ramas `feature/*` y `fault-injection*` ya históricas).
- Specs cerradas al 100% (detalle en `specs/`):
  - 001 login: 5 tests · 002 checkout: 3 · 003 inventory: 7
  - 004 cart: 10 · 005 sort: 8 · 006 session-logout: 10
- `npm run test:all`: 43 passed en Chromium. `npm run lint:determinism`: 0 `waitForTimeout`.
- FAULT-01 a FAULT-03 sembrados; resultados y clave en `docs/rca/fault-injection-key.md`.
- FAULT-04 a FAULT-09 sembrados para medición ciega; clave en docs/rca/blind-key.md
- Medición ciega FAULT-04 a 09, 3 corridas: el agente local acierta la mitad de las veces y cambia de respuesta entre corridas; el triage manual acierta más en el mismo tiempo; detalle en docs/rca/blind-triage.md
- Misma medición ciega con Claude Code + Sonnet: acierta mucho más que el modelo local y algo más que el triage manual (muestra pequeña), de forma estable y unas 5 veces más rápido; detalle en docs/rca/blind-triage-claude.md
- Reporter de evidencias v2 (ADR 003): `last-failure.json` con `schemaVersion: 2`, todos los errores, paso fallido, snapshot ARIA y consola/red del navegador (adjunto `browser-evidence` del fixture `page`).
- Calibración de /triage: 3/3 fallos sembrados con la categoría correcta (1 corrida cada uno, dentro del diseño; detalle en docs/rca/).
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
- Las intercepciones de red de los fallos sembrados se configuran por proyecto en `playwright.faults.config.ts` (opciones `abortedRoutes` y `responsePatches` del fixture, `[]` por defecto), nunca dentro del test.

## Errores a evitar
- `toBeVisible()` sobre el menú hamburguesa da falso positivo (el menú está fuera de pantalla pero cuenta como visible).
- `#inventory_container` está duplicado en el DOM y rompe el strict mode: usar `[data-test="inventory-container"]`.
- Leer el primer ítem justo después de cambiar el orden puede devolver un valor viejo: esperar el re-render (`selectSortAndSettle`).
- Asumir que el logout limpia `localStorage`: la analítica `backtrace-*` persiste (non-goal).
- Usar CSS cuando existe rol o `data-test` (`.bm-menu-wrap` es la única excepción justificada).
- Editar fallos sembrados o "arreglar" un test tocando su `expect`.
- Guardar contexto importante solo en la auto-memoria de Claude Code (OpenCode no la ve).
- Interceptar `**/inventory.html`: el login navega en el cliente y no pide ese documento a la red, así que la ruta nunca se activa.
- Ajustar triage.md mirando fallos de una medición ciega: pasan a estar dentro de la muestra
- El reporter de evidencias debe guardar todos los errores del test, no solo el primero: un timeout global oculta el error que lo causó

## Pendientes y observaciones
- Sembrar un nuevo lote ciego (FAULT-10 en adelante) para validar cualquier cambio en triage.md
- Cada herramienta usa un MCP de Playwright distinto: `@playwright/mcp` en `.mcp.json` y `@executeautomation/playwright-mcp-server` en `opencode.json`.
- `/triage` tiene fija la spec `specs/001-login-saucedemo/spec.md`; para fallos de otras specs, indicar la spec correspondiente.
- Repetir cada medición 3 veces.
- FAULT-04 futuro: cortar el bundle JS y enriquecer el reporter con errores de consola y peticiones fallidas en last-failure.json.
