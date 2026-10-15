# Spec 006 — Cierre de Sesión (Logout) en SauceDemo

Estado: borrador

## Contexto y Objetivo
Certificar el **ciclo de terminación de sesión** de SauceDemo desde la vista autenticada `/inventory.html`. El actor `standard_user` cierra sesión mediante el control **Logout** del menú lateral (hamburguesa) y el sistema debe garantizar las postcondiciones observables de desautenticación: retorno a la vista de login, **eliminación de la credencial de sesión** y **bloqueo del acceso a rutas protegidas** (por navegación directa y por atrás/adelante del navegador), así como la capacidad de **re-autenticarse**.

La implementación de referencia fue caracterizada empíricamente (ver *Evidencia Empírica del AUT*): la sesión se sostiene en una **única cookie cliente `session-username`** (sin `httpOnly`, sin `secure`), que es el **único gate de autenticación**. El cierre de sesión elimina esa cookie; la analítica en `localStorage` **no** se limpia y queda fuera del criterio (RF-9).

> Frontera de alcance: esta spec cubre **el acto de logout y sus postcondiciones**. No re-testea el login (spec 001), ni el carrito/checkout (spec 002/004), ni el catálogo/orden (spec 003/005).

## Definiciones
- **Sesión autenticada:** estado en el que el contexto del navegador posee la cookie `session-username` con el valor del usuario activo (p. ej. `standard_user`). Es el único artefacto de autenticación observado.
- **Credencial de sesión:** la cookie `session-username` (`path=/`, `sameSite=Lax`, **no** `httpOnly`, **no** `secure`).
- **Menú lateral (hamburguesa):** el **burger button** `getByRole('button', { name: 'Open Menu' })` (`#react-burger-menu-btn`, `<button>Open Menu</button>`) y el panel desplegable `.bm-menu-wrap`. La spec **no** normaliza el id CSS: usa el rol accesible.
- **Control Logout:** el ítem del menú `getByRole('button', { name: 'Logout' })` (`<a id="logout_sidebar_link" role="button">Logout</a>`). Nota: es un `<a>` con `role="button"` explícito; **no** coincide con `getByRole('link', ...)`.
- **Menú abierto (criterio determinista):** estado en el que el panel `.bm-menu-wrap` alcanza **asentamiento geométrico estable** (su `transform` X ≈ 0 y/o su bounding box dentro del viewport) **y** el control Logout es **actionable** (Playwright puede ejecutar `click` sobre él). Ver RF-2.
- **Asentamiento geométrico estable:** condición reactiva que reemplaza cualquier espera fija; se apoya en la propiedad computada del panel (transición terminada) y no en un temporizador.
- **Estado asentado de navegación:** estado final tras una navegación (incluida `goBack`/`goForward`), leído **después** de que la red y el re-render se estabilizan; nunca la URL inmediata.
- **Ruta protegida:** `/inventory.html` (y por extensión las vistas autenticadas), cuyo acceso exige la cookie de sesión.
- **Analítica no-auth:** claves de `localStorage` `backtrace-guid` y `backtrace-last-active`, ajenas a la autenticación.
- **0 sleeps:** ausencia total de `page.waitForTimeout()` o pausas arbitrarias (Constitución §3).

## Precondición
- El actor cuenta con **sesión autenticada activa** (`standard_user`), suministrada por login de UI en `beforeEach` (patrón vigente en `tests/checkout.spec.ts`); **desacoplada** de `001-login-saucedemo`.
- Ubicación inicial en `https://www.saucedemo.com/inventory.html`, con el encabezado autenticado renderizado.
- Contexto de navegador aislado por prueba (Constitución §2).

## Fuera de Alcance
- **Login, credenciales y validaciones de acceso** (spec 001). El re-login de RF-7 se verifica **solo** como restauración de sesión tras el logout, no como re-test de 001.
- **Carrito, checkout y confirmación** (spec 002 y 004); **catálogo y orden** (spec 003 y 005).
- **Cierre de sesión desde vistas distintas de `/inventory.html`** (carrito, detalle, checkout): fuera de alcance por decisión de clarificación (Q4).
- **Concurrencia multi-pestaña** y **fallo de red durante el logout**: fuera de alcance por decisión de clarificación (Q5).
- **Limpieza de `localStorage`/`sessionStorage`**: **NO** es un requisito; la analítica no-auth persiste por diseño del AUT (RF-9).
- **Ausencia de "flash" de contenido protegido** durante el redirect del guard: no se exige por ser inobservable de forma fiable (Q3); solo el estado asentado.
- **`Reset App State`, `All Items`, `About`, `Dynamic Catalog`** y demás ítems del menú: no normados por esta spec.

## Historias de Usuario
- **HU-1:** Como usuario autenticado, quiero cerrar mi sesión con una acción explícita y predecible, para terminar mi trabajo de forma segura.
- **HU-2:** Como responsable de seguridad, quiero que tras el logout la credencial de sesión desaparezca y las rutas protegidas queden inaccesibles (incluso vía atrás/adelante), para que nadie continúe usando la sesión.
- **HU-3:** Como usuario, quiero poder volver a iniciar sesión inmediatamente después de cerrar sesión, para continuar operando sin fricción.

## Requisitos Funcionales (EARS en español)
- **RF-1:** CUANDO el usuario autenticado activa el control "Open Menu" (`getByRole('button', { name: 'Open Menu' })`), EL SISTEMA despliega el panel lateral `.bm-menu-wrap` y lo deja en estado **menú abierto** con el control "Logout" disponible y actionable.
- **RF-2:** CUANDO el menú es activado, EL SISTEMA determina el estado "menú abierto" por **asentamiento geométrico estable del panel** (`transform` X ≈ 0 y/o bounding box dentro del viewport) **Y** actionability del control "Logout", **sin** usar `waitForTimeout`. EL SISTEMA **NO** usa la mera visibilidad del enlace (`isVisible()`/`toBeVisible()`) como criterio, por ser un falso positivo cuando el panel está cerrado y off-screen.
- **RF-3:** CUANDO el usuario activa el control "Logout", EL SISTEMA retorna la vista a la página de login (`https://www.saucedemo.com/`).
- **RF-4:** CUANDO el usuario activa el control "Logout", EL SISTEMA elimina la **credencial de sesión** `session-username` del contexto del navegador (la cookie deja de existir).
- **RF-5:** CUANDO se realiza navegación **directa** a `/inventory.html` sin credencial de sesión, EL SISTEMA redirige a la página de login y muestra el mensaje de error `Epic sadface: You can only access '/inventory.html' when you are logged in.` (localizable en `[data-test="error"]`).
- **RF-6:** CUANDO, tras el logout, el usuario utiliza **atrás** (`goBack`) o **adelante** (`goForward`) del navegador, EL SISTEMA no expone contenido protegido en el **estado asentado**: la ubicación final es la página de login y el contenedor de inventario (`#inventory_container`) no está visible. La aserción se realiza sobre el estado asentado, nunca sobre la URL inmediata.
- **RF-7:** CUANDO, tras el logout, el usuario reingresa credenciales válidas, EL SISTEMA restablece una sesión válida y retorna a `/inventory.html`.
- **RF-8:** El logout es **idempotente** respecto de su postcondición observable: repetir la operación de cierre de sesión (o re-solicitar acceso protegido tras el logout) mantiene exactamente el mismo estado (login, sin cookie `session-username`, guard activo) **sin** errores ni estados inconsistentes.
- **RF-9:** EL SISTEMA garantiza que el logout elimina **únicamente** la credencial de sesión; la spec **NO** exige ni asevera la limpieza de `localStorage`/`sessionStorage`, y la persistencia de la analítica no-auth (`backtrace-guid`, `backtrace-last-active`) es comportamiento esperado y explícitamente aceptado.
- **RF-10:** EL SISTEMA localiza los controles con **roles semánticos accesibles** (`getByRole('button', { name: 'Open Menu' })` y `getByRole('button', { name: 'Logout' })`) y usa exclusivamente **aserciones reactivas** de Playwright, con **0 sleeps** (`waitForTimeout` vetado).

## Casos Límite Contemplados
- **Montaje asíncrono del burger:** `getByRole('button', { name: 'Open Menu' })` **no está disponible inmediatamente** tras la navegación a `/inventory.html` (React lo monta async). El arnés debe esperar reactivamente la actionability del control antes de interactuar; no debe aseverar su visibilidad en el primer instante (evidencia: `count()=0` inmediato).
- **Falso positivo de visibilidad del cancelado:** con el menú cerrado, el control Logout está off-screen (`x ≈ -276`) pero `isVisible() === true`. Asertar `toBeVisible()` sobre él **no** prueba que el menú esté abierto (RF-2).
- **Animación del panel:** transición de `0.5s`; asentamiento geométrico completo a **~516ms**. Cualquier interacción/lectura durante la animación es una carrera.
- **`aria-hidden` no es señal de fin:** el panel pasa `aria-hidden="true" → "false"` al **inicio** de la animación (~86ms), no al final; no sirve como criterio de "abierto".
- **Click con menú cerrado:** activar el control Logout sin abrir el menú **falla** (timeout de actionability); abrir el menú es **obligatorio**.
- **`goBack` racy:** tras logout, la URL inmediata puede reportar `/inventory.html` de forma transitoria antes de asentar en `/`. Aseverar sobre la URL inmediata produce falso positivo/negativo; usar el estado asentado (RF-6).
- **Persistencia de analítica:** `localStorage` conserva `backtrace-guid` y `backtrace-last-active` tras el logout; **no** debe aseverarse su limpieza (RF-9).
- **Cookie observable:** `session-username` no es `httpOnly` ni `secure`; su presencia/ausencia es verificable directamente por el contexto del navegador.
- **`goForward` tras logout:** permanece en la página de login (no reabre la sesión).

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
| Gate de autenticación | **exclusivamente** la cookie `session-username` |

**Menú y animación**
| Observación | Dato |
|---|---|
| Burger tras login | no presente en el DOM en el instante inmediato (`count()=0`); monta async |
| Panel cerrado | `transform: translateX(-300px)`, `aria-hidden="true"`, `display:block`, `visibility:visible`, `opacity:1` |
| Visibilidad del Logout con menú cerrado | `isVisible() === true` (off-screen, `x ≈ -276`) → falso positivo |
| Click en Logout sin abrir | timeout de 3000ms (acción no disponible) |
| Asentamiento del panel | `transition 0.5s`, X≈0 a **~516ms** |
| `aria-hidden` al abrir | pasa a `"false"` a **~86ms** (inicio de animación) |

**Navegación post-logout**
| Observación | Dato |
|---|---|
| Logout normal | aterriza en `/`, sin banner de error |
| `goBack()` tras logout | URL transitoria `/inventory.html` → asienta en `/`; `#inventory_container` no visible |
| `goto('/inventory.html')` deslogueado | redirect a `/` + error |
| `goForward()` tras logout | permanece en `/` |

**A11y (roles/nombres)**
| Control | Dato |
|---|---|
| Burger | `<button id="react-burger-menu-btn">Open Menu</button>` → `getByRole('button', { name: 'Open Menu' })` |
| Close | `<button id="react-burger-cross-btn">Close Menu</button>` |
| Logout | `<a id="logout_sidebar_link" role="button">Logout</a>` → `getByRole('button', { name: 'Logout' })` (no `link`) |

## Decisiones de Clarificación (resueltas)
1. **Definición de "logout exitoso" (Q1).** Postcondición = retorno a `/` **+** eliminación de la cookie `session-username` **+** guard de rutas protegidas activo. (Ver RF-3, RF-4, RF-5.)
2. **Criterio de "menú abierto" (Q2).** Asentamiento geométrico estable del panel **+** actionability del Logout; reactivo y sin sleeps. Se descarta `toBeVisible()` del enlace por falso positivo. (Ver RF-2, RF-10.)
3. **Back/Forward post-logout (Q3).** Bloqueo aseverado sobre el **estado asentado** (termina en login, inventario no visible); **no** se exige ausencia de flash. (Ver RF-6.)
4. **Alcance funcional (Q4).** Logout desde `/inventory.html` (vía menú) **+** verificación de re-login. (Ver RF-7; FdA de vistas múltiples.)
5. **Casos límite y guardarraíles (Q5).** Idempotencia del logout **+** `localStorage` como **non-goal** explícito **+** guardarraíl de determinismo (0 sleeps). Se excluyen multi-pestaña y fallo de red. (Ver RF-8, RF-9, RF-10.)

## Criterios de Finalización
- 100% de los requisitos RF-1 a RF-10 cubiertos por pruebas Playwright en TypeScript.
- Matriz de trazabilidad RF → Test formalizada en el plan técnico.
- Ejecución limpia en Chromium con **0 sleeps** (`npm run lint:determinism` en verde) y suite global `npm run test:all` en verde.
- `plan.md` y `tasks.md` derivados **antes** de implementar (Constitución §1).
- Aprobación humana explícita registrada (Human-in-the-Loop): estado transicionado a `aprobada` (pendiente).
