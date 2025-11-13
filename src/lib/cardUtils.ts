// Card type detection utility

export type CardType = 'visa' | 'mastercard' | 'unknown';

/**
 * Detects card type based on card number
 * @param cardNumber - The card number to check
 * @returns The detected card type
 */
export const detectCardType = (cardNumber: string): CardType => {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Visa: starts with 4
  if (/^4/.test(cleanNumber)) {
    return 'visa';
  }
  
  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleanNumber) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9][0-9]|7[0-1][0-9]|720)/.test(cleanNumber)) {
    return 'mastercard';
  }
  
  return 'unknown';
};

/**
 * Formats card number with spaces every 4 digits
 * @param value - The card number to format
 * @returns Formatted card number
 */
export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : cleaned;
};

/**
 * Formats card expiry date as MM/YY
 * @param value - The expiry date to format
 * @returns Formatted expiry date
 */
export const formatCardExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
};
