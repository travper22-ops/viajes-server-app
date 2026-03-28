// CreditCard.ts

/**
 * Interface for CreditCard structure
 */
export interface CreditCard {
  number: string; // Card number (16 digits)
  holderName: string; // Cardholder name
  vendorCode: string; // Vendor code (e.g., VI, CA, AX)
  expiryDate: string; // Expiry date in MMYY format
  cvv?: string; // CVV (3-4 alphanumeric characters, optional)
}

/**
 * Validate a CreditCard object
 * @param creditCard - The CreditCard object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateCreditCard = (creditCard: CreditCard): boolean => {
  // Validate number
  if (!/^[0-9]{16}$/.test(creditCard.number)) {
    throw new Error('Invalid card number: must be 16 digits.');
  }

  // Validate holderName
  if (typeof creditCard.holderName !== 'string' || creditCard.holderName.trim() === '') {
    throw new Error('Invalid holder name: must be a non-empty string.');
  }

  // Validate vendorCode
  if (!/^[a-zA-Z]{2}$/.test(creditCard.vendorCode)) {
    throw new Error('Invalid vendor code: must be 2 alphabetic characters.');
  }

  // Validate expiryDate
  if (!/^(0[1-9]|1[0-2])[0-9]{2}$/.test(creditCard.expiryDate)) {
    throw new Error('Invalid expiry date: must be in MMYY format.');
  }

  // Validate cvv (if provided)
  if (creditCard.cvv && !/^[a-zA-Z0-9]{3,4}$/.test(creditCard.cvv)) {
    throw new Error('Invalid CVV: must be 3-4 alphanumeric characters.');
  }

  return true;
};