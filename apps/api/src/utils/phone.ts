/**
 * Phone number normalization and utility functions for Fidely.
 */

/**
 * Normalizes a phone number by removing whitespace, hyphens, and other punctuation.
 * Preserves a leading '+' for international standard notation.
 * Returns null if empty.
 */
export function normalizePhone(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;
  const trimmed = rawPhone.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  return hasPlus ? `+${digits}` : digits;
}

/**
 * Extracts the significant matching digits (last 8 digits, standard mobile length in Tunisia & many regions).
 */
export function getPhoneSignificantDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 ? digits.slice(-8) : digits;
}
