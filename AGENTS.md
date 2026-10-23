# Contexto Operativo para Agentes de IA (smart-qa-agentic-lab)

Instrucciones compartidas por **OpenCode** (lee este archivo de forma nativa) y **Claude Code** (lo importa desde `CLAUDE.md`).

## Visión general
- Laboratorio de QA agéntico sobre [SauceDemo](https://www.saucedemo.com): pruebas E2E con Playwright + Page Object Model (POM).
- Metodología: Spec-Driven Development (SDD) según Brais Moure → `spec.md` → `plan.md` → `tasks.md` → implementación → validación.
- Control Human-in-the-Loop (HitL): la IA propone y la persona aprueba.
- Fuente normativa: `docs/constitution.md` (§1 SDD, §2 Aislamiento, §3 Determinismo, §4 Localizadores semánticos, §5 Guardarraíles IA).
- Dataset de fallos sembrados para calibrar el Root Cause Analysis (RCA) del triage.

## Stack
- `@playwright/test` ^1.63.0 (TypeScript transpilado por Playwright; sin dependencia directa de `typescript`).
- `@types/node` ^26.6.4 · módulo `commonjs` · Node.js.
- OpenCode con `@opencode-ai/plugin` 1.18.35 (`.opencode/package.json`).
- Claude Code (`.claude/`, `CLAUDE.md`).
- MCP: Claude Code → `@playwright/mcp` + Context7 (`.mcp.json`); OpenCode → `@executeautomation/playwright-mcp-server` (`opencode.json`).

## Estructura
```
specs/001-login-saucedemo/            spec.md · plan.md · tasks.md (cerrada)
specs/002-checkout-saucedemo/         ídem (cerrada)
specs/003-inventory-saucedemo/        ídem (cerrada)
specs/004-cart-saucedemo/             ídem (cerrada)
specs/005-sort-saucedemo/             ídem (cerrada)
specs/006-session-logout-saucedemo/   ídem (cerrada)
pages/            Page Objects (*.page.ts): login, inventory, cart, checkout-step-one/two, checkout-complete
types/            Contratos, constantes y oráculos puros (*.types.ts)
fixtures/         test-fixtures.ts (fixtures de Playwright que inyectan los POM)
utils/            urls.ts
tests/            Suites productivas: auth, checkout, inventory, cart, sort, logout (*.spec.ts)
tests/faults/     Fallos sembrados INMUTABLES: fault-01 (selector), fault-02 (producto), fault-03 (red)
reporters/        agent-context.ts → emite test-results/last-failure.json sanitizado
docs/             constitution.md · adr/ · rca/fault-injection-key.md · backlog-plan-trabajo.md
.opencode/agents/     planner · implementer · reviewer
.opencode/commands/   sdd-spec · sdd-clarify · sdd-plan · sdd-tasks · sdd-implement · sdd-validate · sdd-status · triage · repair
.claude/          settings.json (modo plan, permisos) · hooks/guard-assertions.mjs
.mcp.json         Servidores MCP de Claude Code (playwright, context7)
opencode.json     Servidor MCP de OpenCode (playwright)
playwright.config.ts          baseURL SauceDemo, ignora tests/faults/, reporters html + agent-context
playwright.faults.config.ts   Config exclusivo para los fallos sembrados
```

## Comandos
- `npm test`: suite de login (`tests/auth.spec.ts`) en Chromium.
- `npm run test:all`: todas las suites productivas en Chromium (excluye `tests/faults/`).
- `npm run test:faults`: ejecuta los fallos sembrados con `playwright.faults.config.ts`.
- `npm run lint:determinism`: falla si encuentra `waitForTimeout` en pages, tests, fixtures, types, reporters o utils.
- `npm run triage`: `opencode run /triage` sobre el último fallo.
- Una sola suite: `npx playwright test tests/<suite>.spec.ts --project=chromium`.

## Convenciones
- Código e identificadores (clases, métodos, variables, archivos) en **inglés**.
- Specs, docs, títulos de tests (`test('...')`) y comentarios en **español**.
- POM en `pages/<pantalla>.page.ts`; contratos y oráculos en `types/<dominio>.types.ts`.
- Localizadores semánticos: rol accesible o `data-test` (§4). Cualquier CSS estructural se justifica en la spec.
- Las extensiones de los POM son aditivas y retrocompatibles con las specs anteriores.
- Sincronización reactiva: aserciones web (`expect(locator)...`) o cambios de URL, sobre estado asentado.
- Cada spec nueva sigue la numeración `specs/NNN-<nombre>/` y se cierra con `lint:determinism` y `test:all` en verde.

## Reglas innegociables
1. Prohibido `waitForTimeout`, `sleep` o cualquier espera fija.
2. Nunca modificar, relajar ni borrar un `expect` para que un test pase. Tampoco agregar `test.skip`, `test.fixme` ni `.only`.
3. `tests/faults/` es un dataset de calibración: no se corrige.
4. Aprobación humana antes de aplicar cualquier cambio (HitL): primero se presenta el plan o el diff.
5. No instalar ni actualizar paquetes sin aprobación explícita.
6. No escribir claves, tokens ni secretos en archivos versionados: usar `.env` (está ignorado) y referencias `${VAR}`.

## Memoria
- Al iniciar cada tarea, leer `MEMORY.md`.
- Al terminar cada tarea, actualizar `MEMORY.md` con el estado, las decisiones y los errores a evitar.
- Lo importante se guarda en `MEMORY.md`, **no** en la auto-memoria de Claude Code: OpenCode no la ve.
- `MEMORY.md` no repite el detalle RF por RF de cada spec, porque ya vive en `specs/`.

## Herramientas
### OpenCode
- Ciclo SDD: `/sdd-spec <NNN-nombre> <idea>` → `/sdd-clarify` → `/sdd-plan` → `/sdd-tasks` → `/sdd-implement <NNN-nombre> <Tn>` (una tarea, tests primero) → `/sdd-validate` → `/sdd-status`.
- `/triage`: RCA sobre `test-results/last-failure.json`. Clasifica el fallo en `SELECTOR_DESFASADO`, `BUG_PRODUCTO` o `DATOS_O_ENTORNO`.
- `/repair`: propone un diff quirúrgico solo para `SELECTOR_DESFASADO`.
- Agentes: `planner` (planifica, no escribe código), `implementer` (implementa tareas) y `reviewer` (audita determinismo, POM y trazabilidad).

### Claude Code
- Modo plan por defecto (`permissions.defaultMode: "plan"`): explorar, presentar el plan y esperar aprobación.
- Hook PreToolUse `guard-assertions` (Edit/Write/MultiEdit en `tests/`, `pages/`, `fixtures/`):
  - pide aprobación si se borra o cambia un `expect`, si se agrega skip/fixme/only o si se edita `tests/faults/`;
  - bloquea cualquier `waitForTimeout` nuevo.
- Permisos: allowlist de tests y git de solo lectura; lectura de `.env` denegada.
- MCP: `playwright` (exploración del DOM) y `context7` (documentación).

### Regla de uso
- No usar OpenCode y Claude Code a la vez sobre el mismo cambio. Una herramienta por tarea, y `MEMORY.md` como traspaso entre ambas.
