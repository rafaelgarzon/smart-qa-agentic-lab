# Tareas de Implementación: Spec 001 SauceDemo (SDD)

Estado: lista para desarrollo
Referencia: specs/001-login-saucedemo/plan.md

## Fase 0: Andamiaje y Estructura Base (20 min)
- [x] Tarea 0.1: Crear estructura de directorios `pages/`, `tests/ui/` y `fixtures/`.
  - Archivos: `mkdir -p pages tests/ui fixtures`
  - Criterio de verificación: `ls -d pages tests/ui fixtures` retorna las 3 carpetas.

## Fase 1: Page Object Model Modular (30 min)
- [x] Tarea 1.1: Implementar `LoginPage` con selectores semánticos (`getByPlaceholder`, `getByRole`) y métodos tipados (`loginWithCredentials`, `getErrorMessage`). [RF-1, RF-3, RF-4, RF-5, RF-6]
  - Archivos: `pages/login.page.ts`
  - Criterio de verificación: Compilación limpia sin tipos `any`.
- [x] Tarea 1.2: Implementar `InventoryPage` con verificación semántica de encabezado y conteo de catálogo (`getHeaderText`, `getInventoryItemsCount`). [RF-1, RF-2]
  - Archivos: `pages/inventory.page.ts`
  - Criterio de verificación: Métodos exportados con retorno de Locators tipados.

## Fase 2: Implementación TDD de Suites E2E (30 min)
- [x] Tarea 2.1: Implementar tests de Autenticación Exitosa y Carga de Catálogo en Chromium. [RF-1, RF-2]
  - Archivos: `tests/ui/auth.spec.ts`
  - Criterio de verificación: `npx playwright test tests/ui/auth.spec.ts -g "login exitoso" --project=chromium` en verde.
- [x] Tarea 2.2: Implementar tests de Control de Errores y Casos Límite (credenciales inválidas, usuario bloqueado, campos vacíos). [RF-3, RF-4, RF-5, RF-6]
  - Archivos: `tests/ui/auth.spec.ts`
  - Criterio de verificación: `npx playwright test tests/ui/auth.spec.ts --project=chromium` 100% pasando sin `waitForTimeout`.

## Fase 3: Quality Gate y Auditoría Final (15 min)
- [x] Tarea 3.1: Verificación estricta de cero pausas arbitrarias (`waitForTimeout`) y validación de determinismo.
  - Archivos: todo el repo
  - Criterio de verificación: `git grep "waitForTimeout"` no produce resultados.
