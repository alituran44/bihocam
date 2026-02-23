/**
 * IBAN formatting and validation utilities
 */

/**
 * Formats IBAN with spaces for better readability
 * TR IBAN format: TR + 2 digits + 4 groups of 4 digits + 2 digits
 * Example: TR330006100519786457841326 -> TR33 0006 1005 1978 6457 8413 26
 */
export const formatIban = (iban: string): string => {
  if (!iban) return "";
  
  // Remove all spaces and convert to uppercase
  const clean = iban.replace(/\s/g, "").toUpperCase();
  
  // TR IBAN formatting
  if (clean.startsWith("TR") && clean.length >= 4) {
    const parts = [
      clean.slice(0, 2),  // TR
      clean.slice(2, 4),  // 2 digits
      clean.slice(4, 8),  // 4 digits
      clean.slice(8, 12), // 4 digits
      clean.slice(12, 16), // 4 digits
      clean.slice(16, 20), // 4 digits
      clean.slice(20, 24), // 4 digits
      clean.slice(24, 26), // 2 digits
    ].filter(Boolean);
    
    return parts.join(" ");
  }
  
  // Generic IBAN formatting (4 character groups)
  return clean.match(/.{1,4}/g)?.join(" ") || clean;
};

/**
 * Removes formatting from IBAN (spaces, etc.)
 */
export const cleanIban = (iban: string): string => {
  return iban.replace(/\s/g, "").toUpperCase();
};

/**
 * Validates IBAN format (basic check)
 */
export const isValidIbanFormat = (iban: string): boolean => {
  const clean = cleanIban(iban);
  
  // TR IBAN must be 26 characters (TR + 24 digits)
  if (clean.startsWith("TR")) {
    return clean.length === 26 && /^TR\d{24}$/.test(clean);
  }
  
  // Generic IBAN: 15-34 characters, alphanumeric
  return clean.length >= 15 && clean.length <= 34 && /^[A-Z0-9]+$/.test(clean);
};
