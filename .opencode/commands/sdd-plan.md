---
description: SDD · Genera el plan técnico de una spec aprobada
agent: planner
---
Lee docs/constitution.md y specs/$1/spec.md. NO escribas código ejecutable.

Genera specs/$1/plan.md incluyendo:
- Archivos POM y de pruebas a crear o modificar con su responsabilidad única.
- Modelado de datos y selectores semánticos requeridos.
- Decisiones técnicas justificadas con alternativas descartadas.
- Estrategia de pruebas Playwright indicando qué RF cubre cada caso.

Si la spec no está en "Estado: aprobada" o contiene dudas abiertas [NECESITA ACLARACIÓN], detén la ejecución y avísame.
