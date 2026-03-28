// Baggage.ts

/**
 * Interface for Baggage structure
 */
export interface Baggage {
  count: number; // Baggage capacity
  size: string; // Baggage size
  code: 'S' | 'M' | 'L'; // Baggage size code (Small, Medium, Large)
}

/**
 * Validate a Baggage object
 * @param baggage - The Baggage object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateBaggage = (baggage: Baggage): boolean => {
  if (typeof baggage.count !== 'number' || baggage.count < 0) {
    throw new Error('Invalid baggage count: must be a non-negative number.');
  }

  if (!baggage.size || typeof baggage.size !== 'string') {
    throw new Error('Invalid baggage size: must be a non-empty string.');
  }

  if (!['S', 'M', 'L'].includes(baggage.code)) {
    throw new Error('Invalid baggage code: must be one of S, M, L.');
  }

  return true;
};