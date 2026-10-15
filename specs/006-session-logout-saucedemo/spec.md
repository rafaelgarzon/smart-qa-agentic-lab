# Spec 006 — Cierre de Sesión (Logout) en SauceDemo

Estado: aprobada

## Contexto y Objetivo
Certificar el **ciclo de terminación de sesión** de SauceDemo desde la vista autenticada `/inventory.html`. El actor `standard_user` cierra sesión mediante el control **Logout** del menú lateral (hamburguesa) y el sistema debe garantizar las postcondiciones observables de desautenticación: retorno a la vista de login, **eliminación de la credencial de sesión** y **bloqueo del acceso a la ruta protegida** (por navegación directa y por atrás/adelante del navegador), así como la capacidad de **re-autenticarse**.

La implementación de referencia fue caracterizada empíricamente (ver *Evidencia Empírica del AUT*): la sesión se sostiene en una **única cookie cliente `session-username`** (sin `httpOnly`, sin `secure`), que es el **único gate de autenticación**; su **valor es validado** por el guard de rutas (valores inválidos o vacíos no otorgan acceso). El cierre de sesión elimina esa cookie; la analítica en `localStorage` **no** se limpia y queda fuera del criterio (RF-9).

> Frontera de alcance: esta spec cubre **el acto de logout y sus postcondiciones**. No re-testea el login (spec 001), ni el carrito/checkout (spec 002/004), ni el catálogo/orden (spec 003/005).

## Definiciones
- **Sesión autenticada:** estado en el que el contexto del navegador posee la cookie `session-username` **con un valor de usuario válido** (en el alcance de esta spec, `standard_user`). La mera presencia de la cookie **no** basta: el guard de rutas valida el valor contra los usuarios conocidos de SauceDemo y deniega valores vacíos o no reconocidos (evidencia: `''` y `usuario_falso` → acceso denegado).
- **Credencial de sesión:** la cookie `session-username` (`path=/`, `sameSite=Lax`, **no** `httpOnly`, **no** `secure`). Su verificación de presencia/ausencia se realiza sobre `browserContext.cookies()` (estado del contexto), **no** como locator del DOM.
- **Menú lateral (hamburguesa):** el control de apertura `getByRole('button', { name: 'Open Menu' })` (`#react-burger-menu-btn`) y el panel desplegable `.bm-menu-wrap`. El panel `.bm-menu-wrap` **no** expone `data-test` nativo (ver *Selectores y Justificación (§4)*).
- **Control Logout:** el enlace `[data-test="logout-sidebar-link"]` (`<a id="logout_sidebar_link" role="button" tabindex="-1">Logout</a>`). **No** es localizable por rol con el menú cerrado: con `.bm-menu-wrap[aria-hidden="true"]` el subárbol queda fuera del árbol de accesibilidad y `getByRole('button', { name: 'Logout' })` devuelve 0 coincidencias; por eso se usa el atributo de contrato `data-test`.
- **Menú abierto (criterio determinista, conjunción estricta AND):** el estado es "menú abierto" **si y solo si** se cumplen ambas condiciones reactivas:
  (a) `expect(page.locator('.bm-menu-wrap')).toHaveAttribute('aria-hidden', 'false')`; y
  (b) `expect(page.locator('[data-test="logout-sidebar-link"]')).toBeInViewport({ ratio: 1 })` (enlace **completamente** dentro del viewport = asentado).
  En el criterio de "menú abierto" no se admite la notación aproximada (`≈`) ni la disyunción (`y/o`). **No** se usa `toBeVisible()` del enlace como criterio: es un falso positivo (con el menú cerrado el enlace está off-screen, `x = -276`, pero `isVisible() === true`).
- **Asentamiento (no circular):** la condición (b) `toBeInViewport({ ratio: 1 })` (enlace **completamente** en el viewport) es la señal de asentamiento; es falsa mientras el panel anima (en el flip de `aria-hidden` a ~26 ms el enlace aún está off-screen, ratio 0) y verdadera solo cuando el enlace está plenamente dentro del viewport. Ambas condiciones son **aserciones reactivas web-first** de Playwright (compatibles con §3), sin `waitForTimeout`.
- **Estado asentado post-logout (no circular):** `expect(page).toHaveURL(/^https:\/\/www\.saucedemo\.com\/?$/)` **Y** `expect(page.locator('[data-test="inventory-container"]')).not.toBeVisible()`. La aserción **nunca** se hace sobre la URL inmediata de una navegación.
- **Ruta protegida:** exclusivamente `/inventory.html`. La protección de otras rutas queda **fuera de alcance** por decisión arquitectónica HITL (Q4) — ver *Fuera de Alcance*.
- **Analítica no-auth:** claves de `localStorage` `backtrace-guid` y `backtrace-last-active`, ajenas a la autenticación.
- **0 sleeps:** ausencia total de `page.waitForTimeout()` o pausas arbitrarias (Constitución §3).

## Selectores y Justificación de Último Recurso (§4)
La Constitución §4 exige roles semánticos y accesibilidad como prioridad estricta, admitiendo CSS/atributos solo como último recurso **justificado**. Mapa de selectores normados y su estatus:

| Elemento | Selector normado | Tipo | Justificación |
|---|---|---|---|
| Burger de apertura | `getByRole('button', { name: 'Open Menu' })` | Rol semántico | Preferente (§4). Nota: `[data-test="open-menu"]` resuelve a un `<img>` interceptado por el botón; **no** se usa. |
| Enlace Logout | `[data-test="logout-sidebar-link"]` | Atributo de contrato | Preferente; estable en menú abierto/cerrado. No es localizable por rol con el menú cerrado (subárbol `aria-hidden`). |
| Panel lateral | `.bm-menu-wrap` | Clase CSS (**último recurso**) | Nodo contenedor estructural de la librería externa `react-burger-menu`; **carece** de `data-test` y de rol accesible nativo. Se usa solo para leer `aria-hidden` como señal de apertura. |
| Marcador de inventario | `[data-test="inventory-container"]` | Atributo de contrato | Preferente. Marcador de la cuadrícula de inventario. Se usa solo para la comprobación de no-exposición (RF-6). **No** se usa `#inventory_container`: ese `id` está **duplicado** en el DOM de SauceDemo (el `role="main"` y el propio grid), lo que provoca violación de *strict mode* al aseverar visibilidad; `[data-test="inventory-container"]` es **único** (0 en login, 1 en inventario). |
| Mensaje de error | `[data-test="error"]` | Atributo de contrato | Consistente con el patrón `data-test` del repo (p. ej. `pages/login.page.ts`). |

**Ajuste de auditoría (2026-10-15):** el borrador normaba `#inventory_container` como marcador de inventario. La implementación de TC-1 (strict mode) reveló que ese `id` está **duplicado** en `/inventory.html` (dos nodos: el `role="main"` y el grid con `data-test="inventory-container"`), de modo que `locator('#inventory_container')` resuelve a 2 elementos y rompe la aserción. Se sustituye por `[data-test="inventory-container"]` (único y de mayor prioridad §4 que un `id` CSS). Aprobado por HITL.

## Precondición
- El actor cuenta con **sesión autenticada activa** (`standard_user`), suministrada por login de UI en `beforeEach` (patrón vigente en `tests/checkout.spec.ts`); **desacoplada** de `001-login-saucedemo`.
- Ubicación inicial en `https://www.saucedemo.com/inventory.html`, con el encabezado autenticado renderizado.
- Contexto de navegador aislado por prueba (Constitución §2).

## Fuera de Alcance
- **Login, credenciales y validaciones de acceso** (spec 001). El re-login de RF-7 se verifica **solo** como restauración de sesión tras el logout, no como re-test de 001.
- **Carrito, checkout y confirmación** (spec 002 y 004); **catálogo y orden** (spec 003 y 005).
- **Cierre de sesión desde vistas distintas de `/inventory.html`** y **guard de rutas protegidas distintas de `/inventory.html`** (carrito, detalle, checkout): fuera de alcance por decisión arquitectónica HITL (Q4). La **única** ruta protegida normada es `/inventory.html` (RF-5).
- **Concurrencia multi-pestaña** y **fallo de red durante el logout**: fuera de alcance por decisión de clarificación (Q5).
- **Limpieza de `localStorage`/`sessionStorage`**: **NO** es un requisito; la analítica no-auth persiste por diseño del AUT (RF-9).
- **Ausencia de "flash" de contenido protegido** durante el redirect del guard: no se exige por ser inobservable de forma fiable (Q3); solo el estado asentado.
- **`Reset App State`, `All Items`, `About`, `Dynamic Catalog`** y demás ítems del menú: no normados por esta spec.

## Historias de Usuario
- **HU-1:** Como usuario autenticado, quiero cerrar mi sesión con una acción explícita y predecible, para terminar mi trabajo de forma segura.
- **HU-2:** Como responsable de seguridad, quiero que tras el logout la credencial de sesión desaparezca y la ruta protegida `/inventory.html` quede inaccesible (incluso vía atrás/adelante), para que nadie continúe usando la sesión.
- **HU-3:** Como usuario, quiero poder volver a iniciar sesión inmediatamente después de cerrar sesión, para continuar operando sin fricción.

## Requisitos Funcionales (EARS en español)
- **RF-1:** CUANDO el usuario autenticado activa el control "Open Menu" (`getByRole('button', { name: 'Open Menu' })`), EL SISTEMA despliega el panel lateral `.bm-menu-wrap` y lo deja en estado **menú abierto** con el control "Logout" disponible y actionable.
- **RF-2:** CUANDO el menú es activado, EL SISTEMA determina el estado "menú abierto" mediante la **conjunción estricta (AND)** de: (a) `expect(page.locator('.bm-menu-wrap')).toHaveAttribute('aria-hidden', 'false')` y (b) `expect(page.locator('[data-test="logout-sidebar-link"]')).toBeInViewport({ ratio: 1 })`; ambas aserciones reactivas web-first, **sin** `waitForTimeout`. EL SISTEMA **NO** usa `toBeVisible()` del enlace como criterio, por ser un falso positivo cuando el panel está cerrado y off-screen.
- **RF-3:** CUANDO el usuario activa el control "Logout", EL SISTEMA retorna la vista a la página de login, verificado sobre el **estado asentado**: `expect(page).toHaveURL(/^https:\/\/www\.saucedemo\.com\/?$/)`.
- **RF-4:** CUANDO el usuario activa el control "Logout", EL SISTEMA elimina la **credencial de sesión** `session-username`; la verificación se realiza sobre `browserContext.cookies()` (estado del contexto, no locator del DOM), comprobando la ausencia de la cookie.
- **RF-5:** CUANDO se realiza navegación **directa** a `/inventory.html` sin credencial de sesión válida (cookie ausente, vacía o con valor inválido), EL SISTEMA redirige a la página de login y muestra el mensaje de error `Epic sadface: You can only access '/inventory.html' when you are logged in.` (localizable en `[data-test="error"]`); el banner se verifica para los **tres** casos (evidencia). Esta es la **única** ruta protegida normada (H14).
- **RF-6:** CUANDO, tras el logout, el usuario utiliza **atrás** (`goBack`) o **adelante** (`goForward`) del navegador —una o varias veces, en una secuencia acotada y determinista (H16)—, EL SISTEMA no expone contenido protegido en el **estado asentado**: la ubicación final satisface `/^https:\/\/www\.saucedemo\.com\/?$/` y `expect(page.locator('[data-test="inventory-container"]')).not.toBeVisible()`; además, el guard muestra el mismo banner de error que RF-5 durante estas navegaciones (evidencia). La aserción se realiza sobre el estado asentado, nunca sobre la URL inmediata.
- **RF-7:** CUANDO, tras el logout, el usuario reingresa credenciales válidas, EL SISTEMA restablece una sesión válida; se verifica por el retorno a `/inventory.html` (`expect(page).toHaveURL(/inventory\.html/)`) y por la presencia de la cookie `session-username=standard_user` en `browserContext.cookies()`.
- **RF-8:** CUANDO el usuario realiza un doble clic rápido (ráfaga) sobre `[data-test="logout-sidebar-link"]` estando en `/inventory.html`, EL SISTEMA procesa la operación de forma **idempotente**: concluye en el **estado asentado post-logout** (RF-3, URL `/`) y **sin errores de página no controlados** (`pageerror`), sin exigir un conteo de navegaciones. (Nota: una vez en `/`, el control Logout ya no existe; por eso la idempotencia se define sobre la ráfaga en `/inventory.html`, no sobre un "re-logout".)
- **RF-9:** EL SISTEMA garantiza que el logout elimina **únicamente** la credencial de sesión; la spec **NO** exige ni asevera la limpieza de `localStorage`/`sessionStorage`, y la persistencia de la analítica no-auth (`backtrace-guid`, `backtrace-last-active`) es comportamiento esperado y explícitamente aceptado.
- **RF-10:** EL SISTEMA localiza los controles mediante roles semánticos y atributos de contrato `data-test` (`getByRole('button', { name: 'Open Menu' })` y `[data-test="logout-sidebar-link"]`) y usa exclusivamente **aserciones reactivas** web-first de Playwright, con **0 sleeps** (`waitForTimeout` vetado). El único selector CSS estructural (`.bm-menu-wrap`) se admite **únicamente** con la justificación de último recurso documentada en *Selectores y Justificación (§4)*.

## Casos Límite Contemplados
- **Montaje asíncrono del burger:** `getByRole('button', { name: 'Open Menu' })` **no está disponible inmediatamente** tras la navegación a `/inventory.html` (React lo monta async). El arnés debe esperar reactivamente la actionability del control antes de interactuar. (El `[data-test="open-menu"]` resuelve a un `<img>` interceptado por el botón; **no** se usa para el clic.)
- **Falso positivo de visibilidad del enlace (menú cerrado):** con el menú cerrado, `[data-test="logout-sidebar-link"]` está off-screen (`rect.x = -276`) pero `isVisible() === true`. Por eso el criterio de "menú abierto" usa `toBeInViewport({ ratio: 1 })` (falso off-screen, verdadero solo al entrar plenamente), **no** `toBeVisible()`.
- **`aria-hidden` no es señal de fin de animación:** el panel pasa `aria-hidden="true" → "false"` a **~26 ms**, pero en ese instante el enlace aún está off-screen (`toBeInViewport({ ratio: 1 }) === false`); el asentamiento real lo detecta la conjunción AND de RF-2.
- **Animación del panel:** transición de `0.5s`; el enlace entra al viewport al completarse. Cualquier lectura/aserción que no sea reactiva constituye una carrera.
- **Localizador por rol no usable con menú cerrado:** `getByRole('button', { name: 'Logout' })` devuelve 0 coincidencias con `aria-hidden="true"` (subárbol fuera del árbol de accesibilidad); se usa `[data-test="logout-sidebar-link"]`.
- **Click con menú cerrado:** activar el control Logout sin abrir el menú **falla** (timeout de actionability); abrir el menú es **obligatorio**.
- **Idempotencia por ráfaga:** doble clic rápido sobre `[data-test="logout-sidebar-link"]` no produce errores (`pageerror`) y concluye en el estado asentado post-logout (`/`) con la cookie eliminada (RF-8).
- **`goBack`/`goForward` racysh y múltiple:** tras logout, la URL inmediata puede reportar `/inventory.html` de forma transitoria antes de asentar en `/`; presionar atrás/adelante varias veces mantiene el estado desautenticado. Aseverar sobre el estado asentado (RF-6).
- **Cookie con valor inválido o vacío:** `session-username` con valor `usuario_falso` o `''` **no** otorga acceso (redirect a `/`); el guard valida el valor, no solo la presencia.
- **Persistencia de analítica:** `localStorage` conserva `backtrace-guid` y `backtrace-last-active` tras el logout; **no** debe aseverarse su limpieza (RF-9).
- **Cookie observable:** `session-username` no es `httpOnly` ni `secure`; su presencia/ausencia es verificable vía `browserContext.cookies()`.

## Evidencia Empírica del AUT (obtenida con Playwright · chromium local)
> Caracterización de referencia sobre `standard_user`. No es un requisito: es la base fáctica de las decisiones.

**Modelo de sesión**
| Observación | Dato |
|---|---|
| Cookie tras login | `session-username=standard_user`, `path=/`, `sameSite=Lax`, `httpOnly=false`, `secure=false` |
| `localStorage` tras login | solo `backtrace-guid`, `backtrace-last-active` (sin auth) |
| `sessionStorage` | vacío |
| Cookie tras logout | `[]` (eliminada) |
| `localStorage` tras logout | **persiste** (analítica) |
| `/inventory.html` sin cookie | redirect a `/` + `Epic sadface: You can only access '/inventory.html' when you are logged in.` |
| Gate de autenticación | la cookie `session-username` **con valor validado** (valores `usuario_falso`/`''` → acceso denegado) |

**Menú y animación**
| Observación | Dato |
|---|---|
| Burger tras login | no presente en el DOM en el instante inmediato (`count()=0`); monta async |
| Panel cerrado | `transform: translateX(-300px)`, `aria-hidden="true"`, `display:block`, `visibility:visible`, `opacity:1` |
| Visibilidad del Logout con menú cerrado | `isVisible() === true` (off-screen, `x = -276`) → falso positivo |
| Click en Logout sin abrir | timeout de 3000ms (acción no disponible) |
| Asentamiento del panel | `transition 0.5s`; el enlace entra plenamente al viewport (settle, `toBeInViewport({ ratio: 1 })`) al completarse |
| `aria-hidden` al abrir | pasa a `"false"` a **~26 ms**; en ese instante `toBeInViewport({ ratio: 1 }) === false` (aún off-screen) |

**Navegación post-logout**
| Observación | Dato |
|---|---|
| Logout normal | aterriza en `/`, **sin** banner de error |
| `goBack()` tras logout | URL transitoria `/inventory.html` → asienta en `/`; `[data-test="inventory-container"]` no visible; **banner** `Epic sadface…` presente |
| `goto('/inventory.html')` deslogueado | redirect a `/` + banner `Epic sadface…` |
| `goForward()` tras logout | permanece en `/` (no reabre la sesión); **banner** `Epic sadface…` presente |
| Doble clic en Logout | sin error; navegación final `/`; cookie `session-username` eliminada |
| Cookie inválida (`usuario_falso`) | redirect a `/` (acceso **denegado**) + banner `Epic sadface…` |
| Cookie vacía (`''`) | redirect a `/` (acceso **denegado**) + banner `Epic sadface…` |

**A11y (roles/nombres)**
| Control | Dato |
|---|---|
| Burger | `<button id="react-burger-menu-btn">Open Menu</button>` → `getByRole('button', { name: 'Open Menu' })` (clicable). `[data-test="open-menu"]` = `<img>` interceptado por el botón; no se usa para el clic. |
| Panel | `.bm-menu-wrap`, **sin** `data-test`; `aria-hidden` conmuta `true` (cerrado) / `false` (abierto). |
| Logout | `<a id="logout_sidebar_link" data-test="logout-sidebar-link" role="button" tabindex="-1">Logout</a>` → `[data-test="logout-sidebar-link"]`. `getByRole('button', { name: 'Logout' })` = 0 con el menú cerrado (subárbol `aria-hidden`). |
| Ítems del menú (`data-test`) | `inventory-sidebar-link`, `dynamic-catalog-sidebar-link`, `about-sidebar-link`, `logout-sidebar-link`, `reset-sidebar-link`, `close-menu`. |

## Decisiones de Clarificación (resueltas)
1. **Definición de "logout exitoso" (Q1).** Postcondición = retorno a `/` **+** eliminación de la cookie `session-username` **+** guard de la ruta protegida activo. (Ver RF-3, RF-4, RF-5.)
2. **Criterio de "menú abierto" (Q2).** Conjunción estricta AND: (a) `.bm-menu-wrap` con `aria-hidden="false"` **y** (b) el enlace `[data-test="logout-sidebar-link"]` con `toBeInViewport({ ratio: 1 })` (asentamiento). Reactivo y sin sleeps. Se descarta `toBeVisible()` del enlace por falso positivo off-screen. (Ver RF-2, RF-10.)
   - **Ajuste de auditoría (2026-10-14):** el borrador inicial usaba una condición vaga basada en transform/posición del panel (con notación aproximada y disyunción); se reemplazó por la conjunción estricta verificable. `toBeVisible()` se sustituyó por `toBeInViewport({ ratio: 1 })`: la evidencia muestra que el enlace cerrado es `isVisible()===true` estando off-screen, mientras `toBeInViewport({ ratio: 1 })` discrimina cerrado/animando/abierto (con el `ratio` por defecto el enlace contaría como in-viewport al asomar el primer píxel).
3. **Back/Forward post-logout (Q3).** Bloqueo aseverado sobre el **estado asentado** (termina en login, inventario no visible); **no** se exige ausencia de flash. (Ver RF-6.)
   - **Ajuste de auditoría (2026-10-15):** la evidencia (TC-6) muestra que **atrás consecutivo** agota el historial (`about:blank` sin banner) y que un **adelante** puede aterrizar en una entrada no protegida (sin banner). Para preservar el determinismo (§3) manteniendo el invariante ("nunca se expone contenido protegido"), TC-6 usa una **secuencia acotada que alterna atrás/adelante**; en cada paso el estado asentado es `/` con banner y sin contenido protegido. Aprobado por HITL.
4. **Alcance funcional (Q4).** Logout desde `/inventory.html` (vía menú) **+** verificación de re-login. (Ver RF-7; FdA de vistas múltiples.)
5. **Casos límite y guardarraíles (Q5).** Idempotencia del logout **+** `localStorage` como **non-goal** explícito **+** guardarraíl de determinismo (0 sleeps). Se excluyen multi-pestaña y fallo de red. (Ver RF-8, RF-9, RF-10.)

## Criterios de Finalización
- 100% de los requisitos RF-1 a RF-10 cubiertos por pruebas Playwright en TypeScript.
- Matriz de trazabilidad RF → Test formalizada en el plan técnico.
- `playwright.config.ts` permanece **inmutable** (convención de arnés HITL; sesión vía `beforeEach` desacoplado, sin `auth.setup.ts` global). (H25)
- Ejecución limpia en Chromium con **0 sleeps** y suite global `npm run test:all` en verde. La verificación de determinismo (**`npm run lint:determinism`**) debe **ampliarse** para cubrir **todo el árbol del arnés** (no solo `pages/` y `tests/`): incluir `fixtures/`, `types/`, `reporters/` y helpers, y contemplar archivos nuevos aún no rastreados (p. ej. `git grep --untracked` sobre el árbol del arnés); debe ejecutarse en verde. (H23/N3)
- `plan.md` y `tasks.md` derivados **antes** de implementar (Constitución §1).
- Aprobación humana explícita registrada (Human-in-the-Loop): estado transicionado a `aprobada` (2026-10-14).
