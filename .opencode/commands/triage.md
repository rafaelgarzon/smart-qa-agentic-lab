---
description: Realiza Root Cause Analysis (RCA) sobre el último fallo de pruebas
agent: plan
---

Actúa como un Lead de QA y Auditor de Calidad experto en Root Cause Analysis (RCA).
Lee el reporte de fallo sanitizado en: @test-results/last-failure.json
Consulta la especificación de referencia en: @specs/001-login-saucedemo/spec.md
Consulta la constitución técnica en: @docs/constitution.md (si existe)

Tu objetivo es emitir un diagnóstico estructurado bajo la taxonomía unificada del proyecto.

### TAXONOMÍA OBLIGATORIA
Clasifica ÚNICAMENTE en una de las siguientes opciones:
- BUG_PRODUCTO
- SELECTOR_DESFASADO
- DATOS_O_ENTORNO
- FLAKY
- INDETERMINADO (usa esta opción si la evidencia no es concluyente)

### REGLAS DE GUARDARRAÍL
1. NO propongas cambios de código que modifiquen aserciones web (expect).
2. Si sospechas de un selector desfasado, identifica el cambio en el Page Object afectado.
3. Formato de salida estricto:
   - **Clasificación:** <CATEGORÍA>
   - **Nivel de Confianza:** <ALTA | MEDIA | BAJA>
   - **Evidencia Técnica:** <Breve resumen del error y la línea afectada>
   - **Acción Recomendada:** <Instrucción precisa para el ingeniero sin modificar specs>
