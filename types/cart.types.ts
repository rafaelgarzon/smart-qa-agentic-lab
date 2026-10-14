/**
 * Modelado de la vista de carrito de SauceDemo (spec 004).
 * Reutiliza el patrón de precio compartido con inventario para no duplicar el contrato.
 */
import { PRICE_PATTERN } from './inventory.types';

/**
 * Cantidad invariante por ítem en el carrito (RF-2).
 * SauceDemo no admite incrementos: cada ítem del carrito tiene siempre QTY = 1.
 */
export const CART_QUANTITY = 1;

/**
 * Ítem renderizado en la vista del carrito (RF-1, RF-10).
 */
export interface CartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

/** Patrón de precio `$XX.YY` compartido, reexportado desde `inventory.types`. */
export { PRICE_PATTERN };
