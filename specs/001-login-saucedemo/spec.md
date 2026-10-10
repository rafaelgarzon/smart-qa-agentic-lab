# Spec 001 — Autenticación y Verificación de Catálogo en SauceDemo

Estado: aprobada

## Contexto y objetivo
Validar el mecanismo de autenticación, control de errores y carga del catálogo en SauceDemo bajo selectores semánticos y aserciones deterministas de Playwright.

## Actores
- Usuario activo válido (`standard_user`).
- Usuario con credenciales bloqueadas (`locked_out_user`).
- Usuario con credenciales erróneas.

## Historias de usuario
- HU-1: Como usuario registrado, quiero iniciar sesión para acceder al catálogo de productos.
- HU-2: Como usuario con credenciales erróneas o bloqueadas, quiero recibir un mensaje visual exacto que informe el motivo del bloqueo.

## Requisitos funcionales (EARS en español)
- RF-1: CUANDO el usuario ingresa "standard_user", "secret_sauce" y pulsa el botón de Login, EL SISTEMA redirige a "/inventory.html" y muestra el título "Products" con rol heading.
- RF-2: CUANDO la página de catálogo carga satisfactoriamente, EL SISTEMA presenta al menos un elemento de inventario interactivo visible en pantalla.
- RF-3: SI el usuario ingresa credenciales no coincidentes, ENTONCES EL SISTEMA muestra el contenedor de error con el texto exacto: "Epic sadface: Username and password do not match any user in this service".
- RF-4: EL SISTEMA mantiene aserciones deterministas de estado (`toBeVisible()`) y prohíbe taxativamente esperas estáticas (`waitForTimeout` o pausas de tiempo arbitrarias).
- RF-5: SI el usuario intenta autenticarse dejando el campo de usuario vacío, ENTONCES EL SISTEMA muestra el contenedor de error con el texto exacto: "Epic sadface: Username is required".
- RF-6: SI el usuario ingresa las credenciales de "locked_out_user", ENTONCES EL SISTEMA muestra el contenedor de error con el texto exacto: "Epic sadface: Sorry, this user has been locked out.".

## Criterios de finalización
- 100% de los requisitos RF-1 a RF-6 cubiertos por pruebas Playwright en TypeScript.
- Ejecución limpia en Chromium sin flakiness.
