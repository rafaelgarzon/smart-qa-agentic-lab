// URLs y rutas para SauceDemo
export const BASE_URL = 'https://www.saucedemo.com';

export const ROUTES = {
  login: '/',
  inventory: '/inventory.html',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
