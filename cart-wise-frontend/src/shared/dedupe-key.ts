import type { NormalizedProduct } from "@/shared/schemas";

function escapePart(part: string): string {
  return part.replaceAll("|", "%7C");
}

export function buildDedupeKey(
  storeDomain: string,
  productUrl: string,
  variantKey: string,
): string {
  return [escapePart(storeDomain), escapePart(productUrl), escapePart(variantKey)].join("|");
}

export function dedupeKeyForProduct(product: NormalizedProduct): string {
  return buildDedupeKey(product.storeDomain, product.productUrl, product.variantKey);
}
