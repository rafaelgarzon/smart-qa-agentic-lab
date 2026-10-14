export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export interface GoldenProduct {
  name: string;
  price: number;
}

export const GOLDEN_PRODUCTS: readonly GoldenProduct[] = [
  { name: 'Sauce Labs Backpack', price: 29.99 },
  { name: 'Sauce Labs Bike Light', price: 9.99 },
  { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  { name: 'Sauce Labs Onesie', price: 7.99 },
  { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
];

export const TIE_PRICE = 15.99;

export const COLLATOR_LOCALE = 'en';
export const COLLATOR_OPTIONS: Intl.CollatorOptions = { sensitivity: 'variant' };

export function localeCompareEn(a: string, b: string): number {
  return a.localeCompare(b, COLLATOR_LOCALE, COLLATOR_OPTIONS);
}

function cloneGolden(): GoldenProduct[] {
  return GOLDEN_PRODUCTS.map((product) => ({ ...product }));
}

function sortedGolden(option: SortOption): GoldenProduct[] {
  const products = cloneGolden();
  switch (option) {
    case 'az':
      return products.sort((a, b) => localeCompareEn(a.name, b.name));
    case 'za':
      return products.sort((a, b) => localeCompareEn(b.name, a.name));
    case 'lohi':
      return products.sort((a, b) => a.price - b.price || localeCompareEn(a.name, b.name));
    case 'hilo':
      return products.sort((a, b) => b.price - a.price || localeCompareEn(a.name, b.name));
    default: {
      const exhaustive: never = option;
      throw new Error(`Criterio de orden no soportado: ${String(exhaustive)}`);
    }
  }
}

export function expectedNames(option: SortOption): string[] {
  return sortedGolden(option).map((product) => product.name);
}

export function expectedPrices(option: SortOption): number[] {
  return sortedGolden(option).map((product) => product.price);
}
