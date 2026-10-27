---
title: "ADR 003: Reporter de evidencias v2 (last-failure.json)"
type: adr
status: approved
tags:
  - testing
  - triage
  - rca
  - reporter
date: 2026-10-25
---

# ADR 003: Reporter de evidencias v2 (last-failure.json)

## Contexto
`reporters/agent-context.ts` (v1) guardaba solo `result.error`, que es el primer error del test. En FAULT-05 ese primer error es el timeout global (`Test timeout of 30000ms exceeded.`), sin location ni snippet. El error que lo causó, el `locator.click` pendiente con su `waiting for locator(...)`, quedaba en `result.errors[1]` y no llegaba a `last-failure.json`. El triage manual lo vio en la terminal y el agente no, así que la comparación no era equivalente: el agente se abstuvo y pidió justo ese dato.

## Decisión
1. **Retrocompatibilidad:** se mantienen `testTitle`, `file`, `line`, `durationMs`, `error`, `snippet` y `timestamp`. `error`/`snippet` pasan a ser el primer error de `result.errors` que tenga snippet o location, y `result.error` solo si ninguno los tiene.
2. **Campos nuevos:**
   - `schemaVersion: 2`, `retry` y `outcome`;
   - `errors[]` (todos los errores, con `message`, `location` relativa `archivo:línea` y `snippet`);
   - `failedStep` (el paso más profundo con error en `result.steps`);
   - `pageSnapshot` (el adjunto `error-context` de Playwright);
   - `consoleErrors[]` y `failedRequests[]`.
3. **`pageSnapshot`:** se descarta la sección `# Instructions` del adjunto, que es un prompt de Playwright para LLMs que choca con los guardarraíles de `triage.md`. Se conserva desde `# Test info` y se trunca a 8000 caracteres, con la marca `…[truncado: 8000 de N caracteres]`.
4. **Evidencia de navegador:** el fixture `page` (`fixtures/test-fixtures.ts`) captura `console` (solo `error`) y `requestfailed`, con un máximo de 20 entradas por lista y URLs sin query string. Las adjunta como `browser-evidence` (`types/evidence.types.ts`) solo si el test falló. El cambio es aditivo: no altera el comportamiento de los tests.
5. **Higiene:** todas las rutas son relativas a la raíz del repo, todos los strings pasan por `stripAnsi` y `sanitize`, y no se incluye el nombre del proyecto de Playwright ni las opciones del fixture (`abortedRoutes`, `responsePatches`).

## Consecuencias
- El triage recibe la causa de un timeout global, el árbol ARIA de la página y la evidencia de red y consola, sin ejecutar comandos.
- `file` pasa de ruta absoluta a relativa.
- `last-failure.json` crece: con FAULT-05 ronda los 8 KB, sobre todo por `pageSnapshot`.
- `consoleErrors`/`failedRequests` traen ruido real del AUT, como la analítica `events.backtrace.io` (401 y peticiones abortadas). El triage debe distinguirlo de la causa.
- **Volver a medir FAULT-04 a 09 con v2 ya no es una medición ciega:** esos fallos y su clave ya se conocen y se analizaron. Medir el efecto de v2 requiere un lote nuevo (FAULT-10 en adelante).

## Enlaces Relacionados
- [[002-formalizacion-ciclo-sdd-spec-ears]]
- `reporters/agent-context.ts` · `fixtures/test-fixtures.ts` · `types/evidence.types.ts`
