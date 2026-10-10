---
description: Propone un diff quirúrgico de corrección para fallos clasificados como SELECTOR_DESFASADO
agent: plan
---

Actúa como un Senior QA Automation Engineer siguiendo la filosofía Human-in-the-Loop de Brais Moure.
Lee el reporte de fallo en: @test-results/last-failure.json
Consulta la constitución técnica en: @docs/constitution.md
Consulta el archivo afectado referenciado en el reporte.

### OBJETIVO
Generar una propuesta de corrección en formato `git diff` exclusivamente para desajustes de selectores.

### GUARDARRAÍLES INMUTABLES
1. PROHIBIDO modificar o relajar aserciones (`expect`).
2. PROHIBIDO introducir pausas estáticas (`page.waitForTimeout` o `sleep`).
3. La corrección debe realizarse en el Page Object si el fallo fue por un selector en línea obsoleto o selector desfasado.
4. Muestra únicamente el bloque de código propuesto en formato unified diff (`diff --git ...`) y solicita la confirmación humana explícita antes de que cualquier archivo sea sobreescrito.
