// Agency.ts

/**
 * Interface for Email structure
 */
export interface Email {
  address: string; // Email address (e.g., john@smith.com)
}

/**
 * Interface for Agency structure
 */
export interface Agency {
  contacts: {
    email: Email;
  }[]; // List of contact information
}

/**
 * Validate an Email object
 * @param email - The Email object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateEmail = (email: Email): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.address || !emailRegex.test(email.address)) {
    throw new Error('Invalid email address.');
  }
  return true;
};

/**
 * Validate an Agency object
 * @param agency - The Agency object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateAgency = (agency: Agency): boolean => {
  if (!agency.contacts || !Array.isArray(agency.contacts) || agency.contacts.length === 0) {
    throw new Error('Agency must have at least one contact.');
  }

  agency.contacts.forEach((contact, index) => {
    if (!contact.email) {
      throw new Error(`Contact at index ${index} is missing an email.`);
    }
    validateEmail(contact.email);
  });

  return true;
};