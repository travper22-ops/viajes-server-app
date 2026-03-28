// Location.ts

import { Address, validateAddress } from './Address';

/**
 * Interface for Location structure
 */
export interface Location {
  dateTime: string; // Date and time in ISO 8601 format
  locationCode: string; // Airport code from IATA table codes
  address: Address; // Address information
  name: string; // Place name (e.g., Airport Name, Hotel Name)
  googlePlaceId?: string; // Google place ID (optional)
  uicCode?: string; // UIC code defined by the worldwide railway organization (optional)
}

/**
 * Validate a Location object
 * @param location - The Location object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateLocation = (location: Location): boolean => {
  // Validate dateTime
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(location.dateTime)) {
    throw new Error('Invalid dateTime: must be in ISO 8601 format (YYYY-MM-DDThh:mm:ss).');
  }

  // Validate locationCode
  if (!/^[A-Za-z]{3}$/.test(location.locationCode)) {
    throw new Error('Invalid locationCode: must be a 3-letter IATA code.');
  }

  // Validate address
  validateAddress(location.address);

  // Validate name
  if (typeof location.name !== 'string' || location.name.trim() === '') {
    throw new Error('Invalid name: must be a non-empty string.');
  }

  // Validate googlePlaceId (if provided)
  if (location.googlePlaceId && typeof location.googlePlaceId !== 'string') {
    throw new Error('Invalid googlePlaceId: must be a string.');
  }

  // Validate uicCode (if provided)
  if (location.uicCode && typeof location.uicCode !== 'string') {
    throw new Error('Invalid uicCode: must be a string.');
  }

  return true;
};