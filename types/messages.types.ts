// Tipos para mensajes canónicos de autenticación SauceDemo
// Usados para evitar magic strings y mantener tipado estricto

export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  lockedOutUser: 'Epic sadface: Sorry, this user has been locked out.',
  // Placeholder para validación de campos vacíos (puede variar según UI real)
  emptyFields: 'Epic sadface: Username and password are required',
} as const;

export type LoginErrorMessage = (typeof LOGIN_ERROR_MESSAGES)[keyof typeof LOGIN_ERROR_MESSAGES];

export type LoginErrorKey = keyof typeof LOGIN_ERROR_MESSAGES;
