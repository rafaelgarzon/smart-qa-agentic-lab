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
- DEFECTO_TEST
- FLAKY
- INDETERMINADO (usa esta opción si la evidencia no es concluyente)

### REGLAS DE DECISIÓN (aplícalas en este orden)
1. Si el error es de transporte o de servicio (net::ERR_*, ECONNREFUSED, DNS, HTTP 5xx, page.goto que falla) o de datos/credenciales de prueba inválidos → DATOS_O_ENTORNO.
2. Si la página cargó pero un localizador no aparece (timeout esperando un locator, strict mode violation) → SELECTOR_DESFASADO. Antes de culpar al Page Object, comprueba en qué archivo está escrito el localizador que falló: puede estar directamente en el test.
3. Si una aserción falla con un valor real, compara el valor real con la spec. Si el valor real contradice la spec y el test espera lo que dice la spec → BUG_PRODUCTO.
4. Si una aserción falla con un valor real que coincide con la spec y el test espera otra cosa → DEFECTO_TEST (el oráculo o un paso del test contradice la spec).
5. Si el fallo es intermitente o pasa al reintentar → FLAKY.
6. Si la evidencia no permite aplicar ninguna regla con seguridad → INDETERMINADO.

### REGLAS DE GUARDARRAÍL
1. NO propongas cambios de código que modifiquen aserciones web (expect).
2. Si sospechas de un selector desfasado, identifica el cambio en el archivo donde está escrito el localizador (Page Object o test).
3. Formato de salida estricto:
   - **Clasificación:** <CATEGORÍA>
   - **Nivel de Confianza:** <ALTA | MEDIA | BAJA>
   - **Evidencia Técnica:** <Breve resumen del error y la línea afectada>
   - **Acción Recomendada:** <Instrucción precisa para el ingeniero sin modificar specs>
4. No inventes nombres, textos ni atributos de elementos que no aparezcan en el reporte, la spec o los archivos leídos. Si falta el DOM, dilo.
5. Verificación final: antes de responder, comprueba que la Clasificación coincide con tu Evidencia Técnica y tu Acción Recomendada. Si la evidencia describe un problema de entorno, la clasificación no puede ser BUG_PRODUCTO.
