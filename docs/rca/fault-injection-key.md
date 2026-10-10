# Catálogo de Fallos Sembrados y Calibración RCA

| ID | Test / Archivo | Categoría Real | Diagnóstico IA | Confianza | Precisión | Causa Raíz Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| FAULT-01 | `tests/faults/fault-01-selector-drift.spec.ts` | `SELECTOR_DESFASADO` | `SELECTOR_DESFASADO` | ALTA | 100% | Botón inline obsoleto; Page Object contenía el selector canónico. |
| FAULT-02 | `tests/faults/fault-02-product-bug.spec.ts` | `BUG_PRODUCTO` | `BUG_PRODUCTO` | ALTA | 100% | Mensaje de validación divergente del contrato estipulado en spec.md (RF-6). |
