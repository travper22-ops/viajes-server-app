// Fee.ts

/**
 * Interface for Fee structure
 */
export interface Fee {
  monetaryAmount: string; // Monetary amount of the fee
  currencyCode: string; // Currency code (e.g., USD)
  indicator: string; // Fee category (e.g., AIRPORT, CREDITCARD, CANCELLATION)
}

/**
 * Validate a Fee object
 * @param fee - The Fee object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateFee = (fee: Fee): boolean => {
  // Validate monetaryAmount
  if (typeof fee.monetaryAmount !== 'string' || fee.monetaryAmount.trim() === '') {
    throw new Error('Invalid monetaryAmount: must be a non-empty string.');
  }

  // Validate currencyCode
  if (typeof fee.currencyCode !== 'string' || fee.currencyCode.trim() === '') {
    throw new Error('Invalid currencyCode: must be a non-empty string.');
  }

  // Validate indicator
  if (typeof fee.indicator !== 'string' || fee.indicator.trim() === '') {
    throw new Error('Invalid indicator: must be a non-empty string.');
  }

  return true;
};