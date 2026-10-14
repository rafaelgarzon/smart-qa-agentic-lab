# Contexto Operativo para Agentes de IA (smart-qa-agentic-lab)

## Estado del Repositorio
- Framework: Playwright (TypeScript) + POM + OpenCode TUI + Jest/Node scripts.
- Ciclo Metodológico: Spec-Driven Development (SDD) según Brais Moure.
- Estado: Fase 4 completada en branch `main` con 15+ commits consolidados.

## Estructura Canónica
- `specs/001-login-saucedemo/`: Spec aprobada (RF-1 a RF-6), plan.md cerrado y tasks.md al 100%.
- `pages/`: Page Objects (`LoginPage`, `InventoryPage`) con selectores semánticos y aserciones reactivas.
- `tests/`: Suites productivas (`tests/auth.spec.ts`). Cero pausas estáticas (`waitForTimeout` vetado).
- `tests/faults/`: Dataset de fallos sembrados inmutables (`FAULT-01`, `FAULT-02`) para calibración de RCA.
- `reporters/agent-context.ts`: Reporter sanitizado que emite `test-results/last-failure.json`.
- `.opencode/commands/`: `/triage`, `/repair`, `/sdd-status`.

## Guardarraíles Inmutables
1. Jamás relajar ni modificar aserciones `expect` en tests funcionales para "arreglar" un fallo.
2. Jamás introducir `page.waitForTimeout` o `sleep`.
3. Todo cambio en código requiere confirmación humana (Human-in-the-Loop).
