// CancellationRule.ts

/**
 * Interface for CancellationRule structure
 */
export interface CancellationRule {
  ruleDescription: string; // Description of the cancellation rule
  feeType: 'PERCENTAGE' | 'VALUE'; // Type of fee (percentage or fixed value)
  feeValue: string; // Value of the fee (e.g., "100" or "12.50")
  currencyCode: string; // ISO 4217 currency code (e.g., USD, EUR)
  metricType: 'MINUTES' | 'HOURS' | 'DAYS' | 'YEARS'; // Type of metric
  metricMin: string; // Minimum metric value
  metricMax: string; // Maximum metric value
}

/**
 * Validate a CancellationRule object
 * @param rule - The CancellationRule object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateCancellationRule = (rule: CancellationRule): boolean => {
  if (!rule.ruleDescription || typeof rule.ruleDescription !== 'string') {
    throw new Error('Invalid rule description: must be a non-empty string.');
  }

  if (!['PERCENTAGE', 'VALUE'].includes(rule.feeType)) {
    throw new Error('Invalid fee type: must be PERCENTAGE or VALUE.');
  }

  if (!rule.feeValue || isNaN(parseFloat(rule.feeValue))) {
    throw new Error('Invalid fee value: must be a valid number as a string.');
  }

  const currencyRegex = /^[A-Z]{3}$/;
  if (!rule.currencyCode || !currencyRegex.test(rule.currencyCode)) {
    throw new Error('Invalid currency code: must be a three-letter ISO 4217 code.');
  }

  if (!['MINUTES', 'HOURS', 'DAYS', 'YEARS'].includes(rule.metricType)) {
    throw new Error('Invalid metric type: must be one of MINUTES, HOURS, DAYS, YEARS.');
  }

  if (!rule.metricMin || isNaN(parseFloat(rule.metricMin))) {
    throw new Error('Invalid metric min value: must be a valid number as a string.');
  }

  if (!rule.metricMax || isNaN(parseFloat(rule.metricMax))) {
    throw new Error('Invalid metric max value: must be a valid number as a string.');
  }

  return true;
};