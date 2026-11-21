---
description: Propone un diff quirúrgico de corrección para fallos clasificados como SELECTOR_DESFASADO
agent: plan
---

Actúa como un Senior QA Automation Engineer siguiendo la filosofía Human-in-the-Loop de Brais Moure.
Uso: `/repair SELECTOR_DESFASADO`. Categoría recibida: $ARGUMENTS

### PRECONDICIÓN
Si la categoría recibida falta o no es exactamente `SELECTOR_DESFASADO`, responde solo `No aplica: categoría <X>` (`<X>` = la categoría recibida, o `ninguna` si falta) y termina sin proponer diff.

Lee el reporte de fallo en: @test-results/last-failure.json
Consulta la constitución técnica en: @docs/constitution.md
Consulta el archivo donde está escrito el localizador que falló (`errors[].location`, `failedStep.location` o `snippet` del reporte).

### OBJETIVO
Proponer una corrección en formato unified diff exclusivamente para un localizador desfasado en un Page Object. La persona revisa la propuesta y la aplica.

### GUARDARRAÍLES INMUTABLES
1. Nunca apliques el diff ni escribas, edites o borres archivos: tu salida termina en el diff.
2. Solo puedes proponer cambios en `pages/*.page.ts`. Nunca en `tests/` (incluido `tests/faults/`), `fixtures/` ni `types/`.
3. Si el localizador que falló está escrito en el test y no en un Page Object, no propongas diff: indícalo y escala a la persona.
4. PROHIBIDO modificar, relajar o borrar aserciones (`expect`).
5. PROHIBIDO introducir pausas estáticas (`page.waitForTimeout` o `sleep`).
6. Obtén el localizador correcto del DOM real: primero de `pageSnapshot` en el reporte (`schemaVersion: 2`); si falta o no muestra el elemento, del MCP de Playwright (snapshot de accesibilidad de la página). Cita la línea exacta que respalda el localizador propuesto.
7. No inventes nombres, textos, roles ni atributos que no aparezcan en `pageSnapshot`, en el MCP o en los archivos leídos. Si ninguna fuente muestra el elemento, no propongas diff y di qué falta.
8. Prioridad de localizadores (§4 de la constitución): rol accesible (`getByRole`) > atributo `data-test` (con la forma que ya usan los POM: `page.locator('[data-test="..."]')`) > texto o placeholder (`getByText`, `getByPlaceholder`) > CSS o XPath, solo como último recurso y con justificación explícita.

### FORMATO DE SALIDA ESTRICTO
- **Categoría confirmada:** SELECTOR_DESFASADO
- **Archivo y línea del localizador:** <ruta>:<línea>
- **Localizador actual → propuesto:** `<actual>` → `<propuesto>`
- **Evidencia:** <línea citada de `pageSnapshot` o del MCP, indicando la fuente>
- **Diff:** bloque unified diff (`diff --git ...`), o `Sin diff: <motivo>` si aplica el guardarraíl 3 o el 7. El diff debe aplicarse con `git apply` desde la raíz del repo: rutas relativas con prefijos a/ y b/, y líneas de contexto copiadas exactamente del archivo leído, sin inventarlas ni reformatearlas.
