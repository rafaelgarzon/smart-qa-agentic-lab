# /triage ciego · Claude Code + Sonnet (2026-10-25)

## Configuración
- Modelo: Sonnet, vía `claude -p "/triage"` (`.claude/commands/triage.md`, que delega en `.opencode/commands/triage.md`).
- Worktree cuyo `CLAUDE.md` importa solo `AGENTS.md` (sin `MEMORY.md`).
- Edit, Write y Bash denegados; lectura de `docs/rca/` y `playwright.faults.config.ts` bloqueada por permisos.

## Resultados (3 corridas)

| Fallo | Clave | R1 | Conf. | s | R2 | Conf. | s | R3 | Conf. | s | Acierto |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-04 | `BUG_PRODUCTO` | `BUG_PRODUCTO` ✅ | MEDIA | 16 | `BUG_PRODUCTO` ✅ | ALTA | 23 | `BUG_PRODUCTO` ✅ | ALTA | 26 | 3/3 |
| FAULT-05 | `SELECTOR_DESFASADO` | `INDETERMINADO` ❌ | ALTA | 15 | `INDETERMINADO` ❌ | BAJA | 14 | `INDETERMINADO` ❌ | BAJA | 17 | 0/3 |
| FAULT-06 | `DEFECTO_TEST` | `DEFECTO_TEST` ✅ | ALTA | 18 | `DEFECTO_TEST` ✅ | ALTA | 16 | `DEFECTO_TEST` ✅ | ALTA | 14 | 3/3 |
| FAULT-07 | `DATOS_O_ENTORNO` | `DATOS_O_ENTORNO` ✅ | ALTA | 11 | `DATOS_O_ENTORNO` ✅ | ALTA | 10 | `DATOS_O_ENTORNO` ✅ | ALTA | 11 | 3/3 |
| FAULT-08 | `BUG_PRODUCTO` | `BUG_PRODUCTO` ✅ | ALTA | 22 | `BUG_PRODUCTO` ✅ | ALTA | 20 | `BUG_PRODUCTO` ✅ | ALTA | 22 | 3/3 |
| FAULT-09 | `DEFECTO_TEST` | `DEFECTO_TEST` ✅ | ALTA | 22 | `DEFECTO_TEST` ✅ | ALTA | 15 | `DEFECTO_TEST` ✅ | ALTA | 19 | 3/3 |

- **Aciertos por corrida:** 5/6 · 5/6 · 5/6.
- **Total:** 15/18 (83 %).
- **Voto mayoritario:** 5/6.
- **Tiempo medio:** 17 s (311 s en 18 corridas).
- Las 3 corridas coinciden en los 6 fallos.

## Comparación

| Triage | Aciertos | Precisión | Tiempo medio |
| :--- | :--- | :--- | :--- |
| Agente local (Qwen3.6 35B A3B, OpenCode) | 9/18 | 50 % | 84 s |
| Claude Code + Sonnet | 15/18 | 83 % | 17 s |
| Manual (QA senior, 1 pasada) | 4/6 | 67 % | 97 s |

## FAULT-05: evidencia incompleta
El reporter `reporters/agent-context.ts` guarda solo el primer error del test (`result.error`). En FAULT-05 el primero es el timeout global (`Test timeout of 30000ms exceeded.`). El segundo, el `locator.click` pendiente con su `waiting for locator(...)`, no llega a `last-failure.json` (`snippet: null`). El triage manual sí vio ese segundo error en la terminal, así que en este fallo la comparación manual contra agente no es equivalente. Sonnet se abstuvo con `INDETERMINADO` y pidió exactamente ese dato.

## Salvedades
- Cambió también el harness, no solo el modelo: Claude Code busca por su cuenta la spec correcta, en lugar de quedarse con la spec 001 fija.
- Los fallos los diseñó un modelo de Claude; puede haber sesgo a favor de un modelo de la misma familia.
- Muestra de 6 fallos.
