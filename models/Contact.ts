// Contact.ts

/**
 * Interface for Contact structure
 */
export interface Contact {
  phoneNumber: string; // Contact phone number
  email: string; // Contact email
}

/**
 * Validate a Contact object
 * @param contact - The Contact object to validate
 * @returns True if valid, otherwise throws an error
 */
export const validateContact = (contact: Contact): boolean => {
  const phoneRegex = /^[+]?\d{1,20}$/;
  if (!contact.phoneNumber || !phoneRegex.test(contact.phoneNumber)) {
    throw new Error('Invalid phone number: must be a valid number with up to 20 digits, optionally starting with +.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!contact.email || !emailRegex.test(contact.email)) {
    throw new Error('Invalid email address.');
  }

  return true;
};