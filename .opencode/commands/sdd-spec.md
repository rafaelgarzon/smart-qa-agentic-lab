---
description: SDD · Entrevista y genera la spec (uso: /sdd-spec 002-nombre idea inicial)
agent: planner
---
NO escribas código en ningún momento. Lee docs/constitution.md y specs/ si existen.

Carpeta de la spec: specs/$1/
Idea inicial: $ARGUMENTS

Tu trabajo:
1. Hazme preguntas de UNA en UNA para eliminar ambigüedades (casos límite, errores, fuera de alcance). Máximo 5 preguntas.
2. Con mis respuestas, genera specs/$1/spec.md con la plantilla formal SDD:
   - Estado: borrador
   - Requisitos funcionales en notación EARS en español (CUANDO/SI/MIENTRAS/EL SISTEMA).
3. Describe únicamente el QUÉ y el POR QUÉ: nada de arquitectura ni nombres de archivos de código.
