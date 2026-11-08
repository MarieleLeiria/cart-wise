import type { SavedItem } from "@/shared/schemas";

export function formatVariantLabel(variant: Record<string, string>): string {
  const entries = Object.entries(variant);
  if (entries.length === 0) {
    return "";
  }
  return entries.map(([, value]) => value).join(" · ");
}

export function formatStoreLabel(item: SavedItem): string {
  return item.storeName ?? item.storeDomain;
}

export function formatPrice(amount: number, currency: string): string {
  const exponent = currency === "JPY" || currency === "KRW" ? 0 : 2;
  const value = amount / 10 ** exponent;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}
