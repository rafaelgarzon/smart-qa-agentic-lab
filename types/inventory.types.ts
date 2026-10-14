export interface InventoryProduct {
  name: string;
  description: string;
  price: number;
}

export const EXPECTED_PRODUCT_COUNT = 6;

export const PRICE_PATTERN = /\$([0-9]+\.[0-9]{2})/;

export const SORT_OPTIONS = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hilo',
} as const;

export const SORT_LABELS = {
  nameAsc: 'Name (A to Z)',
  nameDesc: 'Name (Z to A)',
  priceAsc: 'Price (low to high)',
  priceDesc: 'Price (high to low)',
} as const;

export type SortValue = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];
export type SortKey = keyof typeof SORT_OPTIONS;
