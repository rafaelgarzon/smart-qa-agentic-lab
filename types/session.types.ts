import type { Cookie } from '@playwright/test';

/** Origen canónico del AUT. */
export const SAUCEDEMO_ORIGIN = 'https://www.saucedemo.com';

/** Dominio de la cookie de sesión. */
export const SAUCEDEMO_DOMAIN = 'www.saucedemo.com';

/** Nombre de la única cookie que sostiene la sesión (gate de autenticación). */
export const SESSION_COOKIE_NAME = 'session-username';

/** Valor de usuario válido dentro del alcance de la spec 006. */
export const SESSION_USER = 'standard_user';

/** Ruta protegida normada por la spec 006. */
export const PROTECTED_PATH = '/inventory.html';

/** URL asentada de la vista de login (raíz). */
export const ROOT_URL_PATTERN = /^https:\/\/www\.saucedemo\.com\/?$/;

/** Claves de analítica no-auth que persisten tras el logout (RF-9; non-goal de limpieza). */
export const ANALYTICS_STORAGE_KEYS = ['backtrace-guid', 'backtrace-last-active'] as const;

export type AnalyticsStorageKey = (typeof ANALYTICS_STORAGE_KEYS)[number];

/**
 * Devuelve la cookie de sesión (`session-username`) si está presente en la colección dada.
 * Función pura: no accede al DOM ni al navegador.
 */
export function findSessionCookie(cookies: readonly Cookie[]): Cookie | undefined {
  return cookies.find((cookie) => cookie.name === SESSION_COOKIE_NAME);
}

/**
 * Indica si la colección contiene la cookie de sesión (`session-username`).
 * Función pura: no accede al DOM ni al navegador.
 */
export function hasSessionCookie(cookies: readonly Cookie[]): boolean {
  return findSessionCookie(cookies) !== undefined;
}
