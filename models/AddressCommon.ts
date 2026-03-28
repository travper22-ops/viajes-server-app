// AddressCommon.ts

/**
 * Interface for AddressCommon structure
 */
export interface AddressCommon {
  line: string; // Address line with street, number, building, etc.
  zip: string; // Post office code number
  countryCode: string; // Two-character standard IATA country code
  cityName: string; // City, town, or postal station
  stateCode: string; // Two-character standard IATA state code
}

/**
 * Validate an AddressCommon object
 * @param address - The AddressCommon object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateAddressCommon = (address: AddressCommon): boolean => {
  if (!address.line || address.line.length < 1 || address.line.length > 70) {
    throw new Error('Invalid address line: must be between 1 and 70 characters.');
  }

  if (!address.zip || address.zip.length < 1 || address.zip.length > 120) {
    throw new Error('Invalid zip code: must be between 1 and 120 characters.');
  }

  if (!address.countryCode || !/^[a-zA-Z]{2}$/.test(address.countryCode)) {
    throw new Error('Invalid country code: must be a two-character IATA code.');
  }

  if (!address.cityName || address.cityName.length < 1 || address.cityName.length > 35) {
    throw new Error('Invalid city name: must be between 1 and 35 characters.');
  }

  if (!address.stateCode || !/^[a-zA-Z0-9]{1,2}$/.test(address.stateCode)) {
    throw new Error('Invalid state code: must be a one- or two-character IATA code.');
  }

  return true;
};