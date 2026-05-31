export const DEFAULT_CURRENCY = 'PKR';

const CURRENCY_MINOR_EXPONENT: Record<string, number> = {
  PKR: 2,
  USD: 2,
  EUR: 2,
};

export function getCurrencyExponent(currency: string): number {
  return CURRENCY_MINOR_EXPONENT[currency] ?? 2;
}

/**
 * Parse user money input into integer minor units (e.g. PKR paisa).
 * Never uses parseFloat for persistence.
 */
export function parseMoneyInput(
  input: string,
  currency: string = DEFAULT_CURRENCY,
): number | null {
  const trimmed = input.trim().replace(/,/g, '');
  if (!trimmed) return null;

  const exponent = getCurrencyExponent(currency);
  const parts = trimmed.split('.');
  if (parts.length > 2) return null;

  const majorPart = parts[0].replace(/\s/g, '');
  const minorPart = parts[1] ?? '';

  if (!/^\d+$/.test(majorPart)) return null;
  if (minorPart && !/^\d+$/.test(minorPart)) return null;
  if (minorPart.length > exponent) return null;

  const major = Number(majorPart);
  if (!Number.isSafeInteger(major) || major < 0) return null;

  const minorDigits = minorPart.padEnd(exponent, '0').slice(0, exponent);
  const minor = minorDigits ? Number(minorDigits) : 0;
  if (!Number.isSafeInteger(minor) || minor < 0) return null;

  const amountMinor = major * 10 ** exponent + minor;
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) return null;

  return amountMinor;
}

export function formatMoney(
  amountMinor: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const exponent = getCurrencyExponent(currency);
  const major = Math.floor(amountMinor / 10 ** exponent);
  const minor = amountMinor % 10 ** exponent;
  const minorText =
    exponent > 0 ? `.${String(minor).padStart(exponent, '0')}` : '';

  const formattedMajor = major.toLocaleString(undefined);
  if (currency === 'PKR') {
    return `₨${formattedMajor}${minorText}`;
  }
  return `${currency} ${formattedMajor}${minorText}`;
}

export function amountMinorToInputString(
  amountMinor: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const exponent = getCurrencyExponent(currency);
  const major = Math.floor(amountMinor / 10 ** exponent);
  const minor = amountMinor % 10 ** exponent;
  if (exponent === 0) return String(major);
  return `${major}.${String(minor).padStart(exponent, '0')}`;
}
