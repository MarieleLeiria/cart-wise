import { minorUnitExponent, VALID_CURRENCY_CODES } from "@/shared/currency-codes";
import type { CaptureReason } from "@/shared/capture-reasons";

export type PriceParseResult =
  { ok: true; amount: number; currency: string } | { ok: false; reason: CaptureReason };

const SYMBOL_CURRENCY: Record<string, string> = {
  R$: "BRL",
  US$: "USD",
  "€": "EUR",
  "£": "GBP",
};

export function resolveCurrency(priceText: string, currencyHint?: string): string | null {
  if (currencyHint && /^[A-Za-z]{3}$/.test(currencyHint)) {
    const code = currencyHint.toUpperCase();
    if (VALID_CURRENCY_CODES.has(code)) {
      return code;
    }
  }
  for (const [symbol, code] of Object.entries(SYMBOL_CURRENCY)) {
    if (priceText.includes(symbol)) {
      return code;
    }
  }
  return null;
}

export function parsePriceText(priceText: string, currencyHint?: string): PriceParseResult {
  const currency = resolveCurrency(priceText, currencyHint);
  if (!currency) {
    return { ok: false, reason: "currency_unknown" };
  }
  const exponent = minorUnitExponent(currency);
  let cleaned = priceText;
  for (const symbol of Object.keys(SYMBOL_CURRENCY)) {
    cleaned = cleaned.replaceAll(symbol, "");
  }
  cleaned = cleaned.replace(/[A-Za-z$€£¥\s]/g, "");
  if (!cleaned) {
    return { ok: false, reason: "invalid_payload" };
  }
  const digitsOnly = cleaned.replace(/[^\d.,]/g, "");
  if (!digitsOnly) {
    return { ok: false, reason: "invalid_payload" };
  }
  const lastDot = digitsOnly.lastIndexOf(".");
  const lastComma = digitsOnly.lastIndexOf(",");
  let decimalSep: "." | "," | null = null;
  if (lastDot >= 0 && lastComma >= 0) {
    decimalSep = lastDot > lastComma ? "." : ",";
  } else if (lastDot >= 0) {
    const fracLen = digitsOnly.length - lastDot - 1;
    decimalSep = fracLen === exponent ? "." : null;
  } else if (lastComma >= 0) {
    const fracLen = digitsOnly.length - lastComma - 1;
    decimalSep = fracLen === exponent ? "," : null;
  }
  let normalized = digitsOnly;
  if (decimalSep === ",") {
    normalized = digitsOnly.replace(/\./g, "").replace(",", ".");
  } else if (decimalSep === ".") {
    normalized = digitsOnly.replace(/,/g, "");
  } else {
    normalized = digitsOnly.replace(/[.,]/g, "");
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, reason: "invalid_payload" };
  }
  const [wholePart, fracPart = ""] = normalized.split(".");
  if (fracPart.length > exponent) {
    return { ok: false, reason: "invalid_payload" };
  }
  const paddedFrac = fracPart.padEnd(exponent, "0");
  const factor = 10 ** exponent;
  const amount = Number(wholePart) * factor + Number(paddedFrac || "0");
  if (!Number.isFinite(amount) || amount < 0) {
    return { ok: false, reason: "invalid_payload" };
  }
  return { ok: true, amount, currency };
}
