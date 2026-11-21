# Qwen con reporter v2 y prueba de Devstral Small 2 24B (2026-11-10)

## 1. Qwen3.6 con reporter v2 (3 corridas)

| Fallo | Clave | R1 | R2 | R3 | Acierto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-04 | `BUG_PRODUCTO` | ✅ | `DEFECTO_TEST` ❌ | `DEFECTO_TEST` ❌ | 1/3 |
| FAULT-05 | `SELECTOR_DESFASADO` | ✅ | ✅ | ✅ | 3/3 |
| FAULT-06 | `DEFECTO_TEST` | ✅ | ✅ | ✅ | 3/3 |
| FAULT-07 | `DATOS_O_ENTORNO` | ✅ | ✅ | ✅ | 3/3 |
| FAULT-08 | `BUG_PRODUCTO` | sin diagnóstico ❌ | `SELECTOR_DESFASADO` ❌ | sin diagnóstico ❌ | 0/3 |
| FAULT-09 | `DEFECTO_TEST` | `SELECTOR_DESFASADO` ❌ | `SELECTOR_DESFASADO` ❌ | `SELECTOR_DESFASADO` ❌ | 0/3 |

- **Aciertos por corrida:** 4/6 · 3/6 · 3/6.
- **Total:** 10/18 (56 %), frente a 9/18 con v1 (`blind-triage.md`).
- **FAULT-05:** sube de 1/3 a 3/3. No es ciego, porque fue el fallo que motivó el cambio de reporter (ADR 003).
- **Sin FAULT-05:** 7/15 con v2 frente a 8/15 con v1.
- **Tiempo medio:** 91 s.
- **Los 2 sin diagnóstico en FAULT-08:** una sesión terminó tras dos `Glob` sin responder; la otra llamó a `Glob` sin el parámetro `pattern` y no se recuperó.

## 2. Devstral Small 2 24B (1 corrida)

Configuración: MLX 4-bit en LM Studio, OpenCode y reporter v2.

| Fallo | Clave | Devstral | Tiempo (s) |
| :--- | :--- | :--- | :--- |
| FAULT-04 | `BUG_PRODUCTO` | `DEFECTO_TEST` ❌ | 313 |
| FAULT-05 | `SELECTOR_DESFASADO` | sin diagnóstico ❌ | 103 |
| FAULT-06 | `DEFECTO_TEST` | `DEFECTO_TEST` ✅ | 87 |
| FAULT-07 | `DATOS_O_ENTORNO` | `DATOS_O_ENTORNO` ✅ | 83 |
| FAULT-08 | `BUG_PRODUCTO` | sin diagnóstico ❌ | 94 |
| FAULT-09 | `DEFECTO_TEST` | sin diagnóstico ❌ | 80 |

- **Total:** 2/6, con 127 s de media.
- **Los 3 sin diagnóstico:** el modelo escribió las llamadas a herramientas como texto (`read[ARGS]{...}`) y OpenCode cerró la sesión.
- **Decisión:** descartado tras 1 corrida.

## 3. Nota operativa
LM Studio recarga los modelos con contexto 8192 si no se fija 32768 en su configuración.
