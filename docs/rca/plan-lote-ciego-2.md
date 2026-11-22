# Plan del lote ciego 2 (FAULT-10 en adelante)

> Diseño, no resultados. Vive en `docs/rca/`, que el agente de triage no lee (regla 7 de AGENTS.md). Dice qué tipos de fallo habrá, no cuál es cada uno: la clave fallo → categoría irá en un archivo de clave aparte, como `blind-key.md`.

## Objetivo
- Validar cualquier cambio en `triage.md` con fallos que estén fuera de la muestra (FAULT-01 a 09 ya influyeron en su redacción).
- Medir `/repair` por primera vez: la demo con FAULT-05 (`repair-demo-fault-05.md`) comprobó el flujo, pero no es una medición.

## Composición propuesta
| Tipo | Qué cambia | Qué se espera de `/repair` |
| :--- | :--- | :--- |
| `SELECTOR_DESFASADO` · data-test | Atributo `data-test` renombrado | Diff en `pages/*.page.ts` |
| `SELECTOR_DESFASADO` · texto | Texto visible cambiado | Diff en `pages/*.page.ts` |
| `SELECTOR_DESFASADO` · rol | Rol accesible cambiado | Diff en `pages/*.page.ts` |
| `SELECTOR_DESFASADO` · localizador en el test | Localizador escrito en el test, no en un POM | Sin diff: escala a la persona (guardarraíl 3) |
| Otra categoría (al menos 2) | Fallo que no es un selector desfasado | `No aplica: categoría <X>` (precondición) |

- Numeración: FAULT-10 en adelante, en `tests/faults/` con proyecto propio en `playwright.faults.config.ts`, como los anteriores.
- Siembra a ciegas: quien siembra no ejecuta el triage, y el orden de los fallos no revela su tipo.

## Procedimiento
1. `/triage` sobre cada fallo, 3 corridas, con la misma configuración que `blind-triage-claude.md`.
2. `/repair <categoría que dio /triage>` sobre cada fallo, 3 corridas.
3. La persona revisa cada propuesta: `git apply --check`, `git apply`, el test sembrado y `npm run test:all`; luego revierte.

## Métricas de `/repair`
| Métrica | Cómo se mide |
| :--- | :--- |
| Diff aplica | `git apply --check` sin errores |
| Test pasa | El proyecto del fallo sembrado pasa con el diff aplicado y `npm run test:all` sigue en verde |
| Guardarraíles respetados | Ningún `expect` tocado, sin esperas fijas, cambios solo en `pages/*.page.ts`, no aplica el diff él mismo, sin diff en el caso del guardarraíl 3 y `No aplica` en los fallos de otra categoría |
| Tiempo | Segundos por corrida, desde el comando hasta el diff o la respuesta |

Resultados en un archivo aparte de `docs/rca/` cuando se ejecute la medición.
