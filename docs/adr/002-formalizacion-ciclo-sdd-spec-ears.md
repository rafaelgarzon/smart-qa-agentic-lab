---
title: "ADR 002: Formalización del Ciclo SDD y Primera Spec EARS"
type: adr
status: approved
tags:
  - testing
  - sdd
  - ears
  - opencode
  - clean-code
date: 2026-10-10
---

# ADR 002: Formalización del Ciclo SDD y Primera Spec EARS

## Contexto
Siguiendo las directrices del desarrollo con IA expuestas por Brais Moure, se elimina el desarrollo basado en suposiciones (*vibe coding*). Se adopta una estructura de especificación previa basada en requisitos verificables con sintaxis **EARS** (*Easy Approach to Requirements Syntax*).

## Decisión Técnica
1. **Separación de Responsabilidades:** La especificación (`spec.md`) aborda únicamente el QUÉ y el POR QUÉ a nivel funcional y de negocio. No incluye nombres de archivos ni código de implementación.
2. **Repositorio Local Unificado:** La especificación y el backlog maestro conviven en la raíz del proyecto para actuar como contexto inmediato para los agentes de CLI.
3. **Control Human-in-the-Loop:** Ninguna implementación se genera hasta que la spec atraviese la clarificación de ambigüedades y la aprobación del plan técnico.

## Enlaces Relacionados
- [[001-constitution-testing]]
- [[specs/001-login-saucedemo/spec]]
- [[opencode-playwright-mcp]]
