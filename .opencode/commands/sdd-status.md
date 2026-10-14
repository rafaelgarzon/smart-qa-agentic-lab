---
description: SDD · Auditoría de estado, trazabilidad de requisitos y siguiente paso
agent: plan
---

Actúa como un Lead de QA y Auditor de Spec-Driven Development (SDD).

Spec objetivo: `$1` — el nombre de la carpeta bajo `specs/` a auditar (p. ej. `002-checkout-saucedemo`).
Si `$1` está vacío o no corresponde a una carpeta existente en `specs/`, lista las carpetas disponibles y detente solicitando un identificador válido. Nunca asumas `001`.

Lee, para la spec `specs/$1/`:
- Especificación (obligatoria): @specs/$1/spec.md
- Plan técnico: `specs/$1/plan.md` (léelo solo si existe)
- Desglose de tareas: `specs/$1/tasks.md` (léelo solo si existe)
Lee la memoria operativa en: @MEMORY.md (si existe)
Lee la constitución técnica en: @docs/constitution.md (si existe)

Tu objetivo es emitir un reporte breve de estado:
1. Fase actual del ciclo SDD (Especificación, Plan, Tareas, Implementación o Validación).
2. Tareas completadas vs pendientes (x de y); si `tasks.md` no existe, repórtalo como ausente.
3. Matriz de trazabilidad de Requisitos Funcionales (RF-1 a RF-6) con estado por requisito.
4. Siguiente acción recomendada para el ingeniero.

REGLAS:
- Este comando es de SOLO LECTURA: no modifiques, escribas ni edites ningún archivo.
- Si un artefacto no existe, repórtalo explícitamente como ausente; nunca inventes su contenido.
