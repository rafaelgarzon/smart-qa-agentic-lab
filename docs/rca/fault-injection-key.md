# Catálogo de Fallos Sembrados y Calibración RCA

Los resultados de FAULT-01 en esta tabla se obtuvieron antes de neutralizar nombres y títulos (2026-10-23); las mediciones posteriores están en las secciones de iteración.

| ID | Test / Archivo | Categoría Real | Diagnóstico IA | Confianza | Precisión | Causa Raíz Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-01 | `tests/faults/fault-01.spec.ts` | `SELECTOR_DESFASADO` | `SELECTOR_DESFASADO` | ALTA | 100% | Botón inline obsoleto; Page Object contenía el selector canónico. |
| FAULT-02 | `tests/faults/fault-02.spec.ts` | `BUG_PRODUCTO` | `BUG_PRODUCTO` | ALTA | categoría correcta (1 corrida) | Respuesta del producto alterada: el proyecto `chromium-02` de `playwright.faults.config.ts` parchea el bundle `assets/index-*.js` mediante la opción `responsePatches` del fixture. Evidencia esperada: `toHaveText` con Expected = RF-6 (`Epic sadface: Sorry, this user has been locked out.`) y Received = `Epic sadface: Sorry, this account is temporarily unavailable.`. |

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

En esta iteración FAULT-02 quedó excluido: el diseño anterior esperaba un texto inventado mientras el producto cumplía RF-6, así que no era un fallo de producto válido. Se rediseñó después (ver la fila de FAULT-02 en la tabla principal) y se mide en la siguiente iteración.

## Iteración 2 · FAULT-02 rediseñado (2026-10-23)

| Fallo | Clave | Triage | Confianza | Categoría | Evidencia | Acción | Tiempo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-02 | `BUG_PRODUCTO` | `BUG_PRODUCTO` | ALTA | correcta | correcta: el localizador resuelve, no hay error de transporte y el test coincide con RF-6 y con messages.types.ts | parcial: propone validar con producto, pero inventa causas (rate-limiting, rotación de credenciales, IP/región) y antepone actualizar la spec a reportar el bug | 130 s |

Acumulado con las mismas reglas: 3/3 fallos con la categoría correcta, 1 corrida por fallo. Limitación: FAULT-02 se diseñó después de escribir las reglas y su escenario coincide con la regla 3, así que confirma la regla pero no mide generalización. La generalización se medirá con fallos nuevos escritos sin consultar triage.md. Pendiente de calidad: que la acción recomendada no invente causas que no aparecen en la evidencia.
