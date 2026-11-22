> Fuente oficial del plan; el documento en Claude Docs es una vista para presentar.

# Plan de trabajo – Automatización inteligente con IA
Oct 3, 2026 · @Rafael garzon

## Resumen
Entrega de un framework Playwright con triage asistido por IA cubriendo el módulo 12. Plazo original: 8 semanas; **fecha de cierre vigente: 2026-12-30**.
- Sprint 1 – Harness: repo, constitución, AGENTS.md y spec EARS piloto.
- Sprint 2 – Framework core: suite piloto UI + API en CI, con evidencias legibles por agentes.
- Sprint 3 – RCA asistido: skill rca-triager clasificando fallos reales.
- Sprint 4 – Mantenimiento supervisado: propuestas de diff con aprobación humana y métricas.

## Cronograma (actualizado 2026-11-21)
Fechas de lo terminado según el historial de git; las de lo pendiente son estimadas.

| # | Paso | Sprint | Estado | Fecha |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Harness: constitución, AGENTS.md/MEMORY.md, SDD con EARS | 1 | ✅ Terminado | 10 oct |
| 2 | Specs 001 a 006 con POM: 43 tests, 0 esperas fijas | 2 | ✅ Terminado | 10–15 oct |
| 3 | Reporter de evidencias v2 (ADR 003) | 2 | ✅ Terminado | 27 oct |
| 4 | `/triage` calibrado (FAULT-01 a 03) y medido a ciegas (FAULT-04 a 09) | 3 | ✅ Terminado | 10 oct – 21 nov |
| 5 | `/repair` con guardarraíles y demo con FAULT-05 | 4 | ✅ Terminado | 21 nov |
| 6 | Sembrar lote ciego FAULT-10+ (varios `SELECTOR_DESFASADO` y otras categorías) | 4 | ⏳ Pendiente | 24 nov – 5 dic |
| 7 | Medir `/repair` (3 corridas por fallo) y revalidar `/triage` con el mismo lote | 4 | ⏳ Pendiente | 8 – 12 dic |
| 8 | CI en GitHub Actions: `lint:determinism` + `test:all`, evidencias como artefactos | 2 (deuda) | ⏳ Pendiente | 15 – 17 dic |
| 9 | Pruebas de API: elegir objetivo o sacarlas del alcance con un ADR | 2 (deuda) | ⏳ Pendiente | 18 – 23 dic |
| 10 | Decisiones abiertas: `data-test` en la §4 de la constitución, unificar MCP de Playwright | — | ⏳ Pendiente | 22 – 23 dic |
| 11 | Cierre: informe final con métricas, ADRs y lo que quedó fuera | — | ⏳ Pendiente | 26 – 30 dic |

- El Sprint 3 se implementó como el comando `/triage`, no como un skill `rca-triager`.
- El paso 9 ocupa toda su ventana si se implementan pruebas de API; si se saca del alcance, basta un día para el ADR.
