# Catálogo de Fallos Sembrados y Calibración RCA

Los resultados de esta tabla se obtuvieron antes de neutralizar nombres y títulos (2026-10-23); hay que volver a medir.

| ID | Test / Archivo | Categoría Real | Diagnóstico IA | Confianza | Precisión | Causa Raíz Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-01 | `tests/faults/fault-01.spec.ts` | `SELECTOR_DESFASADO` | `SELECTOR_DESFASADO` | ALTA | 100% | Botón inline obsoleto; Page Object contenía el selector canónico. |
| FAULT-02 | `tests/faults/fault-02.spec.ts` | `BUG_PRODUCTO` | `BUG_PRODUCTO` | ALTA | 100% | Mensaje de validación divergente del contrato estipulado en spec.md (RF-6). |

## FAULT-03: Falla de Red e Infraestructura al Autenticar
- **Archivo:** tests/faults/fault-03.spec.ts
- **Causa Raíz Real:** Intercepción y aborto de transporte con connectionfailed simulando caída de backend (DATOS_O_ENTORNO).
- **Comportamiento Verificado de /triage:** Clasificado como DATOS_O_ENTORNO con confianza ALTA. Veta cambios a selectores o aserciones web.
