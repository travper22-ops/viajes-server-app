// DiscountCode.ts

/**
 * Enum for DiscountCode types
 */
export enum DiscountCodeType {
  CD = 'CD', // Corporate Discount Code
  PC = 'PC', // Promotional/Campaign Discount Code
}

/**
 * Interface for DiscountCode structure
 */
export interface DiscountCode {
  type: DiscountCodeType; // Type of discount
  value: string; // Discount code value
}

/**
 * Validate a DiscountCode object
 * @param discountCode - The DiscountCode object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateDiscountCode = (discountCode: DiscountCode): boolean => {
  // Validate type
  if (!Object.values(DiscountCodeType).includes(discountCode.type)) {
    throw new Error(`Invalid discount type: must be one of ${Object.values(DiscountCodeType).join(', ')}.`);
  }

  // Validate value
  if (typeof discountCode.value !== 'string' || discountCode.value.trim() === '') {
    throw new Error('Invalid discount value: must be a non-empty string.');
  }

  return true;
};