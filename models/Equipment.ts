// Equipment.ts

/**
 * Enum for Equipment codes
 */
export enum EquipmentCode {
  BBS = 'BBS', // Baby stroller/Push chair
  BYC = 'BYC', // Bicycle rack
  CBB = 'CBB', // Cargo barrier rack
  CBF = 'CBF', // Cargo barrier front
  CBS = 'CBS', // Booster seat for child under 135cm or up to 12 years
  CSB = 'CSB', // Child seat for 1-3 years / 9-18 Kg
  CSI = 'CSI', // Child seat for 0-12 months / 0-13 Kg
  CST = 'CST', // Child seat for 4-7 years / 15-30 Kg
  SBR = 'SBR', // Snowboard racks
  SKB = 'SKB', // Ski box
  SKR = 'SKR', // Ski rack
  TAB = 'TAB', // Travel Tablet
  WAR = 'WAR', // Wheelchair access ramp
  WHC = 'WHC', // Wheelchair
  WIF = 'WIF', // Wi-Fi access
  CNT = 'CNT', // Charger cable
}

/**
 * Interface for Tax structure
 */
export interface Tax {
  monetaryAmount: string;
  indicator: string;
  natureCode: string;
  countryCode: string;
  rate: string;
}

/**
 * Interface for Fee structure
 */
export interface Fee {
  monetaryAmount: string;
  currencyCode: string;
  indicator: string;
}

/**
 * Interface for PointsAndCash structure
 */
export interface PointsAndCash {
  monetaryAmount: string;
}

/**
 * Interface for Quotation structure
 */
export interface Quotation {
  monetaryAmount: string;
  currencyCode: string;
  isEstimated: boolean;
  base: {
    monetaryAmount: string;
  };
  discount: {
    monetaryAmount: string;
  };
  taxes: Tax[];
  fees: Fee[];
  totalTaxes: PointsAndCash;
  totalFees: PointsAndCash;
}

/**
 * Interface for Equipment structure
 */
export interface Equipment {
  code: EquipmentCode; // Extra equipment code
  itemId: string; // Extra equipment identifier
  description: string; // Extra equipment description
  quotation: Quotation; // Quotation details
  converted: Quotation; // Converted quotation details
  isBookable: boolean; // Availability for booking
  taxIncluded: boolean; // Whether tax is included in the price
  includedInTotal: boolean; // Whether price is included in total transfer amount
}

/**
 * Validate an Equipment object
 * @param equipment - The Equipment object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateEquipment = (equipment: Equipment): boolean => {
  // Validate code
  if (!Object.values(EquipmentCode).includes(equipment.code)) {
    throw new Error(`Invalid equipment code: must be one of ${Object.values(EquipmentCode).join(', ')}.`);
  }

  // Validate itemId
  if (typeof equipment.itemId !== 'string' || equipment.itemId.trim() === '') {
    throw new Error('Invalid itemId: must be a non-empty string.');
  }

  // Validate description
  if (typeof equipment.description !== 'string' || equipment.description.trim() === '') {
    throw new Error('Invalid description: must be a non-empty string.');
  }

  // Validate quotation
  validateQuotation(equipment.quotation);
  validateQuotation(equipment.converted);

  return true;
};

/**
 * Validate a Quotation object
 * @param quotation - The Quotation object to validate
 */
const validateQuotation = (quotation: Quotation): void => {
  if (typeof quotation.monetaryAmount !== 'string' || quotation.monetaryAmount.trim() === '') {
    throw new Error('Invalid monetaryAmount in quotation: must be a non-empty string.');
  }

  if (typeof quotation.currencyCode !== 'string' || quotation.currencyCode.trim() === '') {
    throw new Error('Invalid currencyCode in quotation: must be a non-empty string.');
  }

  if (typeof quotation.isEstimated !== 'boolean') {
    throw new Error('Invalid isEstimated in quotation: must be a boolean.');
  }

  // Validate base and discount
  if (!quotation.base || typeof quotation.base.monetaryAmount !== 'string') {
    throw new Error('Invalid base in quotation: must have a valid monetaryAmount.');
  }

  if (!quotation.discount || typeof quotation.discount.monetaryAmount !== 'string') {
    throw new Error('Invalid discount in quotation: must have a valid monetaryAmount.');
  }

  // Validate taxes
  if (!Array.isArray(quotation.taxes)) {
    throw new Error('Invalid taxes in quotation: must be an array.');
  }
  quotation.taxes.forEach((tax) => {
    if (typeof tax.monetaryAmount !== 'string' || tax.monetaryAmount.trim() === '') {
      throw new Error('Invalid tax monetaryAmount: must be a non-empty string.');
    }
  });

  // Validate fees
  if (!Array.isArray(quotation.fees)) {
    throw new Error('Invalid fees in quotation: must be an array.');
  }
  quotation.fees.forEach((fee) => {
    if (typeof fee.monetaryAmount !== 'string' || fee.monetaryAmount.trim() === '') {
      throw new Error('Invalid fee monetaryAmount: must be a non-empty string.');
    }
  });
};