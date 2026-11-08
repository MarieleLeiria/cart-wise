/** ISO 4217 codes embedded in the extension (no network). */
export const VALID_CURRENCY_CODES = new Set([
  "BRL",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "KRW",
  "CLP",
  "VND",
  "BHD",
  "KWD",
  "OMR",
]);

export const CURRENCY_MINOR_UNITS: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  CLP: 0,
  VND: 0,
  BHD: 3,
  KWD: 3,
  OMR: 3,
};

export function minorUnitExponent(currency: string): number {
  return CURRENCY_MINOR_UNITS[currency] ?? 2;
}
