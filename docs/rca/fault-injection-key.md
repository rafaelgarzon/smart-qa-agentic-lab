# Catálogo de Fallos Sembrados y Calibración RCA

Los resultados de esta tabla se obtuvieron antes de neutralizar nombres y títulos (2026-10-23); hay que volver a medir.

| ID | Test / Archivo | Categoría Real | Diagnóstico IA | Confianza | Precisión | Causa Raíz Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-01 | `tests/faults/fault-01.spec.ts` | `SELECTOR_DESFASADO` | `SELECTOR_DESFASADO` | ALTA | 100% | Botón inline obsoleto; Page Object contenía el selector canónico. |
| FAULT-02 | `tests/faults/fault-02.spec.ts` | `BUG_PRODUCTO` | `BUG_PRODUCTO` | ALTA | 100% | Mensaje de validación divergente del contrato estipulado en spec.md (RF-6). |

## FAULT-03: Falla de Red e Infraestructura al Autenticar
- **Archivo:** tests/faults/fault-03.spec.ts
- **Causa Raíz Real:** Aborto del documento raíz (`https://www.saucedemo.com/`) con `connectionfailed`, inyectado desde el proyecto `chromium-03` de `playwright.faults.config.ts` mediante la opción `abortedRoutes` del fixture (DATOS_O_ENTORNO). Evidencia esperada: `page.goto: net::ERR_CONNECTION_FAILED at https://www.saucedemo.com/`.
- **Comportamiento Verificado de /triage:** ~~Clasificado como DATOS_O_ENTORNO con confianza ALTA.~~ **No válido:** con la versión anterior (`page.route('**/inventory.html')` dentro del test) el test nunca falló, porque la navegación a `/inventory.html` ocurre en el cliente y no genera ninguna petición de red. Pendiente de medir con la nueva inyección.

## Línea base · /triage sin reglas de decisión (2026-10-23)

Contexto: Qwen3.6-35B-A3B MLX 4-bit en LM Studio (contexto 32768), reporter v1, `triage.md` sin reglas de decisión.

| Fallo | Clave | Triage | Categoría | Evidencia | Acción | Tiempo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-01 | `SELECTOR_DESFASADO` | `SELECTOR_DESFASADO` | correcta | incorrecta: culpa al Page Object e inventa el nombre "LOGIN" | incorrecta: cambiar un Page Object que está bien | ≈68 s (promedio de la corrida) |
| FAULT-02 | `BUG_PRODUCTO` | — | no evaluable | — | — | — |
| FAULT-03 | `DATOS_O_ENTORNO` | `BUG_PRODUCTO` | incorrecta | incorrecta | incorrecta | 47 s |

Precisión de categoría: 1/2 fallos válidos. FAULT-02 no evaluable: el valor real coincide con la spec.

## Iteración 1 · reglas de decisión en /triage (dentro de la muestra)

| Fallo | Clave | Triage | Confianza | Categoría | Evidencia | Acción | Tiempo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-01 | `SELECTOR_DESFASADO` | `SELECTOR_DESFASADO` | ALTA | correcta | correcta: ubica el localizador en el test y toma "Login" del Page Object | correcta: corregir el localizador del test (mejor aún: usar `loginPage.loginButton`) | 51 s |
| FAULT-03 | `DATOS_O_ENTORNO` | `DATOS_O_ENTORNO` | ALTA | correcta | correcta: fallo de transporte, descarta el selector | correcta | 91 s |

Precisión de categoría: 2/2 fallos válidos (línea base: 1/2). Medición dentro de la muestra: las reglas se escribieron mirando FAULT-01 y FAULT-03; la generalización se mide con fallos nuevos. Observación: la salida no siempre respeta el formato (preámbulo en inglés, nota extra).

FAULT-02 excluido: el valor real coincide con RF-6, así que bajo las reglas actuales es DEFECTO_TEST y la clave BUG_PRODUCTO no es válida hasta rehacerlo.
