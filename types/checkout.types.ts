export interface CustomerInformation {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const CHECKOUT_MESSAGES = {
  completeHeader: 'Thank you for your order!',
  errorFirstNameRequired: 'Error: First Name is required',
  errorLastNameRequired: 'Error: Last Name is required',
  errorPostalCodeRequired: 'Error: Postal Code is required',
} as const;
