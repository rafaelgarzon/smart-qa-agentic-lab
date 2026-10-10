# Plan Técnico: Autenticación y Verificación de Catálogo en SauceDemo

**Especificación base:** `specs/001-login-saucedemo/spec.md`  
**Fecha:** 2026-10-10  
**Idioma:** Español  
**Equipo/Role:** Test Automation Lead Architect

---

## 1. Objetivo del Plan

Diseñar la arquitectura técnica para cubrir los requisitos funcionales RF-1 al RF-6 definidos en la especificación, utilizando **Playwright** con **TypeScript**, aplicando principios de **destructividad controlada**, **determinismo** y **mantenibilidad**. Este plan es previo a la escritura de código de tests.

---

## 2. Requisitos funcionales a cubrir

Según `spec.md`:

| ID | Descripción EARS |
|---|---|
| RF-1 | CUANDO el usuario ingresa credenciales válidas y confirma el formulario, EL SISTEMA redirige a la vista del catálogo y presenta el encabezado principal de productos. |
| RF-2 | CUANDO el catálogo carga satisfactoriamente, EL SISTEMA muestra al menos un ítem de inventario visible y disponible. |
| RF-3 | SI el usuario ingresa una contraseña errónea, ENTONCES EL SISTEMA muestra un mensaje de alerta indicando que el usuario y la contraseña no coinciden. |
| RF-4 | EL SISTEMA mantiene aserciones deterministas de estado visible y prohíbe pausas estáticas arbitrarias de tiempo (sleeps). |
| RF-5 | SI el usuario intenta autenticarse con campos vacíos, ENTONCES EL SISTEMA mantiene la permanencia en la página de login y muestra un mensaje de validación que impide el acceso al catálogo. |
| RF-6 | SI el usuario intenta autenticarse con `locked_out_user`, ENTONCES EL SISTEMA muestra un mensaje de error específico indicando que el usuario está bloqueado. |

*(Nota: RF-5 y RF-6 se derivan de los casos límite descritos en la especificación para garantizar completitud y trazabilidad.)*

---

## 3. Arquitectura y Patrón de Diseño

Se adoptará el patrón **Page Object Model (POM) modular y estricto** con TypeScript. Objetivo: encapsular lógica de UI, centralizar selectores, facilitar mantenimiento y promover reutilización.

### 3.1. Componentes

| Componente | Ubicación propuesta | Responsabilidad |
|---|---|---|
| `LoginPage` | `pages/login.page.ts` | Encapsula navegación a `/`, ingreso de credenciales, acción de login (click en botón o submit), lectura de mensajes de error/validación, y comprobaciones de estado en login. |
| `InventoryPage` | `pages/inventory.page.ts` | Encapsula lectura del encabezado de catálogo, verificación de ítems, acceso a rutas y comprobaciones de estado en catálogo. |
| `BasePage` (opcional) | `pages/base.page.ts` | Métodos comunes: `goto()`, `waitForUrl()`, `waitForLocatorVisible()` con tipo estricto. Usar únicamente si reduce duplicidad. |
| Fixtures | `fixtures/test-fixtures.ts` | Configuración de `test`, `expect`, inicialización de Page Objects y aislamiento de estado. |
| Tests funcionales | `tests/auth.spec.ts` | Casos que cubren RF-1 a RF-6. |
| Helpers (mínimos) | `utils/` | Exclusivamente utilidades de tipado o constantes de rutas/mensajes si son necesarias. No incluir sleeps ni waits fijos. |

### 3.2. Principios de diseño

- **Tipado estricto:** Todos los locators, parámetros, retornos y mensajes usan `string`, `Locator`, tipos literales o `Readonly<>` cuando aplique.
- **Encapsulación:** Los tests **NO** deben acceder directamente a selectores CSS/XPath. Únicamente a métodos públicos de los Page Objects.
- **Single Responsibility:** Cada Page Object representa una vista y expone acciones/aseveraciones semánticas relevantes al dominio (login, catálogo).
- **Sin lógica de negocio en tests:** La orquestación de pasos debe residir en los Page Objects; los tests expresan intención (dado/cuando/entonces) de forma legible.
- **Determinismo:** Cualquier espera debe estar ligada a **estado visible/estable** del DOM o a cambios de URL. **Prohibido** `page.waitForTimeout()`.

---

## 4. Estrategia de Selectores

La prioridad es usar APIs semánticas y accesibles de Playwright para reducir fragilidad y alinear con los requisitos de accesibilidad del NFR.

### 4.1. Orden de prioridad (estricto)

1. **`getByRole`** – Preferido para elementos interactivos/estructurales con roles ARIA (botones, formularios, headings, alertas).
2. **`getByPlaceholder`** – Para campos de entrada con placeholder conocido.
3. **`getByLabel`** – Si el formulario usa `<label for=...>`.
4. **`getByText`** – Para textos estáticos (encabezados, mensajes de alerta/validación). Debe usarse con precisión (texto exacto o `exact: true` cuando el texto canónico esté definido).
5. **`getByTestId`** – Solo como último recurso si no existe alternativa semántica accesible. **No recomendado** a menos que el AUT lo exponga explícitamente.
6. **CSS/XPath** – **Prohibidos** como primera opción. Solo admisibles de forma excepcional y justificada en el Page Object, documentando la razón. Evitar en lo posible.

### 4.2. Candidatos semánticos esperados (referenciales, no selectores finales)

- **Login:** Campos `username`/`password` (por placeholder/label/role `textbox`), botón de login (role `button` con texto asociado), contenedor/mensaje de error/validación (role `alert` o región con texto).
- **Inventory:** Encabezado principal de productos (role `heading` a nivel adecuado con texto identificativo), lista de ítems (role `list`/`listitem` o contenedor semántico), elementos representativos de "ítem de inventario visible y disponible" (precio visible, botón "Add to cart" habilitado o texto indicativo según definición validada).
- **Mensajes:** Alertas de error/validación (role `alert`) cuando existan para asegurar lectura accesible.

> **Nota:** No se escriben cadenas de selectores concretas aquí. La elección final se realizará al implementar Page Objects, respetando la prioridad anterior.

---

## 5. Política de Aserciones y Esperas

Cumplimiento obligatorio de **RF-4**: aserciones deterministas de estado visible y prohibición de pausas estáticas arbitrarias.

### 5.1. Reglas estrictas

- **Prohibido:** `page.waitForTimeout()` en cualquier lugar (tests, Page Objects, helpers, fixtures).
- **Único mecanismo de espera válido:** Esperas automáticas de Playwright asociadas a **visibilidad/estabilidad** del elemento o a **cambios de estado** (URL, navegación).
- **Auto-reintentos:** Usar exclusivamente **aserciones web** de `@playwright/test` (`expect(locator).toBeVisible()`, `expect(locator).toHaveText()`, `expect(locator).toBeEnabled()`, `expect(page).toHaveURL()`, `expect(locator).toHaveCount()`, etc.). Estas reintentan hasta timeout configurado.
- **Sin sleeps manuales:** No se aceptan esperas fijas mínimas. Si se requiere sincronización, debe hacerse mediante `locator.waitFor({ state: 'visible' })` o aserciones `expect` auto-reintentables.
- **Estado "visible y disponible":** Para RF-2, la verificación debe vincularse a **visibilidad** del ítem y a una condición de "disponibilidad" validada (ver apartado 5.3) mediante aserciones auto-reintentables.
- **Determinismo:** Las aserciones deben validar **estado observable** (texto, visibilidad, URL, count) nunca supuestos de tiempo.

### 5.2. Timeout por defecto

- Respetar `playwright.config.ts` (timeout de test/action/navigation). No hardcodear timeouts arbitrarios salvo justificación explícita y mínima.
- Las esperas deben ser implícitas vía `expect` o `waitFor` con estado, evitando valores mágicos sin razón.

### 5.3. Definiciones operativas (para trazabilidad y evitar ambigüedad)

Para garantizar verificabilidad:

- **"Confirma el formulario" (RF-1):** Se entenderá como la acción de envío válida (clic en botón de login o submit del formulario) que provoca la navegación/actualización de estado. Ambos modos deben contemplarse si ambos existen en UI; la elección concreta se documentará en Page Object.
- **"Encabezado principal de productos" (RF-1):** Debe identificarse por **role heading** y texto canónico definido (a confirmar con pregunta al negocio/UX si difiere del esperado). Aserción: `expect(heading).toBeVisible()`.
- **"Ítem de inventario visible y disponible" (RF-2):** Requiere **al menos un `<listitem>`/elemento de ítem visible**. "Disponible" implica condición observable: p.ej. precio visible y/o botón "Add to cart" **habilitado**. La condición exacta debe validarse con el negocio; provisionalmente se exigirá **visibilidad + habilitación del botón "Add to cart"** del ítem, o alternativamente **precio visible + no marcado como agotado**. Cualquier cambio a esta definición quedará registrado.
- **Mensaje RF-3:** Texto canónico a establecer (contraseña errónea / credenciales no coinciden). Aserción por `toBeVisible()` y `toHaveText()` con texto exacto acordado.
- **RF-5 (campos vacíos):** Permanencia en login (`toHaveURL` de login o heading/login visible). Mensaje de validación visible (role `alert` o texto de validación). No debe producir redirección a `/inventory.html`.
- **RF-6 (`locked_out_user`):** Mensaje de error específico visible (role `alert`/texto canónico acordado). Permanencia en login o comportamiento acordado.

---

## 6. Fixtures y Gestión de Estado

Se prioriza **aislamiento total** entre tests para eliminar dependencias y flakiness.

### 6.1. Fixtures propuestas

- `page`: fixture nativa de Playwright (proporcionada). Cada test recibe una página nueva.
- `loginPage`: instancia de `LoginPage` vinculada a la página del test.
- `inventoryPage`: instancia de `InventoryPage` vinculada a la página del test.
- `test`: envuelto con configuración estándar (sin `test.beforeEach` global que imponga login). El login solo se realiza explícitamente en tests que lo requieran (RF-1–RF-2).
- `expect`: heredado de `@playwright/test` (sin overrides que introduzcan sleeps).

### 6.2. Gestión de estado

- **Sin estado compartido:** Ningún test debe depender del resultado de otro test. Cada test debe ser autónomo.
- **Sin caché de sesión:** No reutilizar storageState entre tests a menos que se justifique explícitamente. Para este alcance (autenticación básica + catálogo) se recomienda **no compartir sesión** para validar flujo completo desde login.
- **Navegación limpia:** Cada test inicia con navegación explícita (`loginPage.goto()` o equivalente). No asumir estado previo.
- **Datos:** Usar credenciales válidas/inválidas fijas y explícitas (`standard_user`, `locked_out_user`, contraseña válida/inválida según configuración del entorno). No generar datos dinámicos innecesarios.
- **Sin side-effects persistentes:** Las acciones son de solo lectura/flujo UI; no hay creación/eliminación de datos persistentes en backend que afecten otros tests (enfoque funcional UI).
- **Cleanup implícito:** Al finalizar cada test, la página se cierra automáticamente por Playwright; no requiere cleanup manual adicional.

### 6.3. Recomendaciones de estructura de archivos

```
specs/001-login-saucedemo/
  ├── plan.md        # Este documento
  └── spec.md        # Especificación base

pages/
  ├── base.page.ts   # (opcional) métodos comunes tipados
  ├── login.page.ts  # POM login
  └── inventory.page.ts

tests/
  └── auth.spec.ts   # Tests RF-1–RF-6

fixtures/
  └── test-fixtures.ts # Fixtures tipadas (opcional según preferencia; alternativa: usar test.extend directamente)

playwright.config.ts  # Configuración base (respetar)
```

> Ubicaciones propuestas alineadas con `AGENTS.md` (experimentos, sin infra innecesaria). Solo se crean archivos necesarios para cumplir el objetivo.

---

## 7. Matriz de Trazabilidad

Mapeo explícito entre requisitos, método del Page Object y archivo de test.

| RF | Descripción resumida | LoginPage (método propuesto) | InventoryPage (método propuesto) | Archivo de test | Criterio de verificación (determinista) |
|---|---|---|---|---|---|
| RF-1 | Login válido → redirección a catálogo + encabezado visible | `loginWithValidCredentials(username, password)`, `submitLogin()` | `getHeaderText()`, `waitForInventoryLoaded()` | `tests/auth.spec.ts` (caso: login exitoso) | `expect(page).toHaveURL(/inventory/)` + `expect(inventory.header).toBeVisible()` con texto canónico. |
| RF-2 | Catálogo con >= 1 ítem visible y disponible | (no aplica directamente) | `getInventoryItems()`, `hasAvailableItem()`, `waitForInventoryLoaded()` | `tests/auth.spec.ts` (caso: login exitoso / verificación catálogo) | `expect(inventory.items).toHaveCount(count >= 1)` y al menos un ítem con condición "disponible" visible (precio + botón habilitado o criterio acordado). |
| RF-3 | Contraseña errónea → mensaje alerta indicando usuario/contraseña no coinciden | `loginWithInvalidPassword(username)`, `getErrorMessage()`, `isOnLoginPage()` | — | `tests/auth.spec.ts` (caso: credenciales inválidas) | `expect(loginPage.errorMessage).toBeVisible()` + texto exacto acordado; permanece en login. |
| RF-4 | Aserciones deterministas + prohibido sleeps | (aplicado transversal) | (aplicado transversal) | Transversal a todos | Validación por `expect` auto-reintentable + ninguna llamada a `waitForTimeout`. Revisado en implementación. |
| RF-5 | Campos vacíos → permanece en login + mensaje de validación, sin acceso a catálogo | `loginWithEmptyCredentials()`, `getValidationMessage()`, `isOnLoginPage()` | — | `tests/auth.spec.ts` (caso: campos vacíos) | `expect(loginPage.validationMessageOrError).toBeVisible()` + `expect(page).not.toHaveURL(/inventory/)` + `isOnLoginPage()`. |
| RF-6 | `locked_out_user` → mensaje específico indicando usuario bloqueado | `loginAsLockedOutUser()`, `getErrorMessage()` | — | `tests/auth.spec.ts` (caso: usuario bloqueado) | `expect(loginPage.errorMessage).toBeVisible()` + texto exacto acordado; permanece en login. |

**Notas de nomenclatura:**
- Los nombres de métodos son **propuestos** (intencionales, semánticos). Pueden refinarse levemente al implementar sin alterar trazabilidad.
- `waitForInventoryLoaded()` debe sincronizarse con **estado visible** (encabezado + primer ítem) usando `expect`/`waitFor` sin sleeps.
- Para RF-5, se contempla mensaje de validación (HTML5 `required`/mensaje UI) o mensaje de error según comportamiento real; la verificación se hará por visibilidad + texto acordado tras validación de UX real si necesario.

---

## 8. Configuración y Convenciones

### 8.1. TypeScript

- `strict: true` (heredado de config base). Tipado explícito en firmas de Page Objects.
- Interfaces/types para locators o estructuras de ítem si se modela (p.ej. `InventoryItem` con locators tipados).
- No `any`. Usar `Locator` de `@playwright/test`.

### 8.2. Playwright

- Usar `@playwright/test` APIs nativas.
- No plugins/custom matchers que añadan sleeps.
- Configuración existente respetada (`AGENTS.md` no impone restricciones específicas; se mantiene mínima).

### 8.3. Convenciones de código

- Archivos `.ts` con nomenclatura `*.page.ts`, `*.spec.ts`, `*.fixtures.ts`.
- Métodos públicos claros, privados para locators internos (`private readonly usernameInput: Locator`).
- Comentarios **NO** añadidos (según instrucciones globales del sistema).
- Sin `console.log` en tests.

### 8.4. Calidad y verificabilidad

- **Determinismo primero:** Toda sincronización vía estado observable.
- **Aislamiento:** Cada test independiente.
- **Legibilidad:** Intención clara en tests, encapsulación en POM.
- **Trazabilidad:** 1:1 entre RF y casos + métodos.

---

## 9. Riesgos, Supuestos y Pendientes de Clarificación

| Ítem | Riesgo/Supuesto | Mitigación/Acción |
|---|---|---|
| Definición "disponible" (RF-2) | Ambigua: ¿precio visible + botón habilitado vs stock vs solo visibilidad? | Validar con negocio/UX. Provisional: exigir visibilidad + botón "Add to cart" habilitado. Si difiere, ajustar `hasAvailableItem()`. |
| Textos canónicos (RF-3, RF-5, RF-6) | Mensajes exactos no especificados en spec.md. | Capturar textos reales en ejecución exploratoria (Playwright codegen/navegación) antes de implementar aserciones con texto exacto. No asumir literales. |
| Acción "confirma formulario" (RF-1) | ¿Solo clic botón o también Enter? | Soportar ambos en `submitLogin()` si aplican; priorizar comportamiento real. |
| Encabezado catálogo (RF-1) | Identificador exacto (heading + texto) no definido. | Identificar por role+texto visible tras login exitoso. |
| Acceso directo a `/inventory.html` sin sesión | No cubierto; impacto en robustez. | Considerar en exploración (comportamiento real) aunque fuera de RF explícitos; documentar hallazgos. |
| `locked_out_user` (RF-6) | Comportamiento/mensaje puede diferir sutilmente. | Verificar texto real antes de fijar aserción. |

---

## 10. Checklist de Implementación (previo a código)

- [ ] Crear estructura de directorios `pages/`, `tests/`, `fixtures/` (según necesidad).
- [ ] Implementar `LoginPage` con locators semánticos (prioridad role/placeholder/label/text).
- [ ] Implementar `InventoryPage` con verificación de encabezado e ítems.
- [ ] Configurar fixtures con aislamiento (sin compartir storageState).
- [ ] Escribir tests `auth.spec.ts` cubriendo RF-1–RF-6 con aserciones `expect` auto-reintentables.
- [ ] Verificar **cero** `waitForTimeout` en código.
- [ ] Ejecutar `npx playwright test --list` para validar estructura.
- [ ] Validar textos canónicos reales (exploración) antes de fijar `toHaveText` exacto.
- [ ] Confirmar cobertura 100% RF-1–RF-6 contra matriz.

---

## 11. Referencias

- `specs/001-login-saucedemo/spec.md`
- `AGENTS.md` (sandbox experimental, sin CI/Docker)
- Playwright docs: [Page Object Models](https://playwright.dev/docs/pom), [Locators](https://playwright.dev/docs/locators), [Assertions](https://playwright.dev/docs/test-assertions), [Best Practices](https://playwright.dev/docs/best-practices)