// Distance.ts

/**
 * Enum for Distance units
 */
export enum DistanceUnit {
  KM = 'KM', // Kilometers
  MI = 'MI', // Miles
}

/**
 * Interface for Distance structure
 */
export interface Distance {
  value: number; // Great-circle distance between two locations
  unit: DistanceUnit; // Unit of the distance (KM or MI)
}

/**
 * Validate a Distance object
 * @param distance - The Distance object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateDistance = (distance: Distance): boolean => {
  // Validate value
  if (!Number.isInteger(distance.value) || distance.value < 0) {
    throw new Error('Invalid distance value: must be a non-negative integer.');
  }

  // Validate unit
  if (!Object.values(DistanceUnit).includes(distance.unit)) {
    throw new Error(`Invalid distance unit: must be one of ${Object.values(DistanceUnit).join(', ')}.`);
  }

  return true;
};