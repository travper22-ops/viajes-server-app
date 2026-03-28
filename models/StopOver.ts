// StopOver.ts

import { Location, validateLocation } from './Location';

/**
 * Interface for StopOver structure
 */
export interface StopOver {
  duration: string; // Transfer stop duration in ISO 8601 format (PnYnMnDTnHnMnS)
  sequenceNumber: number; // Sequence number of the stop
  location: Location; // Location information
}

/**
 * Validate a StopOver object
 * @param stopOver - The StopOver object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateStopOver = (stopOver: StopOver): boolean => {
  // Validate duration
  if (!/^P(T(?=\d+[HMS])(?:\d+H)?(?:\d+M)?(?:\d+S)?|(?:\d+Y)?(?:\d+M)?(?:\d+W)?(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+S)?)?)$/.test(stopOver.duration)) {
    throw new Error('Invalid duration: must be in ISO 8601 duration format (PnYnMnDTnHnMnS).');
  }

  // Validate sequenceNumber
  if (!Number.isInteger(stopOver.sequenceNumber) || stopOver.sequenceNumber <= 0) {
    throw new Error('Invalid sequenceNumber: must be a positive integer.');
  }

  // Validate location
  validateLocation(stopOver.location);

  return true;
};