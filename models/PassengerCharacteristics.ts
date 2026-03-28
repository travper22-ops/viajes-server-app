// PassengerCharacteristics.ts

/**
 * Enum for Passenger Type Codes
 */
export enum PassengerTypeCode {
  CHD = 'CHD', // Child
  ADT = 'ADT', // Adult
}

/**
 * Interface for PassengerCharacteristics structure
 */
export interface PassengerCharacteristics {
  passengerTypeCode: PassengerTypeCode; // Passenger type code (e.g., CHD, ADT)
  age?: number; // Age of the passenger (mandatory if typeCode is CHD)
}

/**
 * Validate a PassengerCharacteristics object
 * @param passenger - The PassengerCharacteristics object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validatePassengerCharacteristics = (passenger: PassengerCharacteristics): boolean => {
  // Validate passengerTypeCode
  if (!Object.values(PassengerTypeCode).includes(passenger.passengerTypeCode)) {
    throw new Error(`Invalid passengerTypeCode: must be one of ${Object.values(PassengerTypeCode).join(', ')}.`);
  }

  // Validate age if passengerTypeCode is CHD
  if (passenger.passengerTypeCode === PassengerTypeCode.CHD) {
    if (typeof passenger.age !== 'number' || passenger.age <= 0) {
      throw new Error('Invalid age: must be a positive number when passengerTypeCode is CHD.');
    }
  }

  return true;
};