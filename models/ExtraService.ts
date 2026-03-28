// ExtraService.ts

import { Quotation, validateQuotation } from './Equipment';

/**
 * Enum for ExtraService codes
 */
export enum ExtraServiceCode {
  DSL = 'DSL', // Driver language specified
  EWT = 'EWT', // Extra waiting time
  MAG = 'MAG', // Meet & Greet
  FLM = 'FLM', // Flight monitoring
  NWS = 'NWS', // Newspaper
  CAI = 'CAI', // Cancellation insurance
  WNR = 'WNR', // Wait and Return
}

/**
 * Enum for ExtraService metric types
 */
export enum MetricType {
  YEARS = 'YEARS',
  DAYS = 'DAYS',
  HOURS = 'HOURS',
  MINUTES = 'MINUTES',
}

/**
 * Interface for ExtraService structure
 */
export interface ExtraService {
  code: ExtraServiceCode; // Extra service code
  itemId: string; // Extra service identifier
  description: string; // Extra service description
  metricType: MetricType; // Extra service time metric type
  metricValue: string; // Extra service metric value
  quotation: Quotation; // Quotation details
  converted: Quotation; // Converted quotation details
  isBookable: boolean; // Availability for booking
  taxIncluded: boolean; // Whether tax is included in the price
  includedInTotal: boolean; // Whether price is included in total transfer amount
}

/**
 * Validate an ExtraService object
 * @param extraService - The ExtraService object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateExtraService = (extraService: ExtraService): boolean => {
  // Validate code
  if (!Object.values(ExtraServiceCode).includes(extraService.code)) {
    throw new Error(`Invalid extra service code: must be one of ${Object.values(ExtraServiceCode).join(', ')}.`);
  }

  // Validate itemId
  if (typeof extraService.itemId !== 'string' || extraService.itemId.trim() === '') {
    throw new Error('Invalid itemId: must be a non-empty string.');
  }

  // Validate description
  if (typeof extraService.description !== 'string' || extraService.description.trim() === '') {
    throw new Error('Invalid description: must be a non-empty string.');
  }

  // Validate metricType
  if (!Object.values(MetricType).includes(extraService.metricType)) {
    throw new Error(`Invalid metric type: must be one of ${Object.values(MetricType).join(', ')}.`);
  }

  // Validate metricValue
  if (typeof extraService.metricValue !== 'string' || extraService.metricValue.trim() === '') {
    throw new Error('Invalid metricValue: must be a non-empty string.');
  }

  // Validate quotation
  validateQuotation(extraService.quotation);
  validateQuotation(extraService.converted);

  return true;
};