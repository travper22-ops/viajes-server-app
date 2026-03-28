// Address.ts

import { AddressCommon, validateAddressCommon } from './AddressCommon';

/**
 * Interface for Address structure
 */
export interface Address extends AddressCommon {
  latitude: number; // Latitude of the location
  longitude: number; // Longitude of the location
}

/**
 * Validate an Address object
 * @param address - The Address object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateAddress = (address: Address): boolean => {
  // Validate common address fields
  validateAddressCommon(address);

  // Validate latitude
  if (typeof address.latitude !== 'number' || address.latitude < -90 || address.latitude > 90) {
    throw new Error('Invalid latitude: must be a number between -90 and 90.');
  }

  // Validate longitude
  if (typeof address.longitude !== 'number' || address.longitude < -180 || address.longitude > 180) {
    throw new Error('Invalid longitude: must be a number between -180 and 180.');
  }

  return true;
};