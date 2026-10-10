# Constitución Técnica del Framework de Automatización

Principios innegociables y reglas inmutables del proyecto `smart-qa-agentic-lab`.

## 1. Spec-Driven Development (SDD)
- Toda prueba deriva de una especificación formal en `specs/` redactada con sintaxis EARS.
- Ningún test se implementa sin un plan técnico (`plan.md`) y un desglose de tareas (`tasks.md`).

## 2. Aislamiento e Independencia
- Cada test debe ser autónomo y autocontenido. Prohibido compartir estado mutable o depender del orden de ejecución.

## 3. Determinismo Estricto
- Prohibición categórica de esperas estáticas (`page.waitForTimeout()` o `sleep`).
- Toda sincronización debe apoyarse en aserciones web reactivas de Playwright (`expect(locator).toBeVisible()`).

## 4. Localizadores Semánticos y Accesibles
- Prioridad estricta a roles semánticos y accesibilidad (`getByRole`, `getByPlaceholder`, `getByText`). Selectores CSS/XPath solo como último recurso justificado.

## 5. Guardarraíles de Inteligencia Artificial (Human-in-the-Loop)
- La IA tiene terminantemente prohibido modificar aserciones (`expect`) para "solucionar" un fallo.
- Toda propuesta de diff de código generada por agentes requiere revisión y aprobación humana explícita antes de aplicarse.
