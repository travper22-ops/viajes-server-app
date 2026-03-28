// Corporation.ts

import { AddressCommon, validateAddressCommon } from './AddressCommon';

/**
 * Interface for Corporation structure
 */
export interface Corporation {
  address: AddressCommon; // Address of the corporation
  info: Record<string, string>; // Corporate information map
}

/**
 * Validate a Corporation object
 * @param corporation - The Corporation object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateCorporation = (corporation: Corporation): boolean => {
  // Validate address
  validateAddressCommon(corporation.address);

  // Validate info
  if (!corporation.info || typeof corporation.info !== 'object') {
    throw new Error('Invalid corporate info: must be a valid object.');
  }

  Object.entries(corporation.info).forEach(([key, value]) => {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error(`Invalid corporate info entry: key and value must be strings. Found key: ${key}, value: ${value}`);
    }
  });

  return true;
};