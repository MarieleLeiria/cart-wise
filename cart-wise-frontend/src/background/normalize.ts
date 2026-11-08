import { parsePriceText } from "@/background/price-parser";
import { normalizeProductUrl } from "@/background/product-url";
import { resolveStoreDomain } from "@/background/store-domain";
import { normalizeVariant, serializeVariantKey } from "@/background/variant-key";
import type { CaptureReason } from "@/shared/capture-reasons";
import type { CapturedProduct, NormalizedProduct } from "@/shared/schemas";
import { capturedProductSchema, normalizedProductSchema } from "@/shared/schemas";

export type NormalizeResult =
  { ok: true; product: NormalizedProduct } | { ok: false; reason: CaptureReason };

function normalizeName(name: string): string | null {
  const collapsed = name.replace(/\s+/g, " ").trim();
  if (!collapsed) {
    return null;
  }
  return collapsed.slice(0, 300);
}

function normalizeImages(images: string[], pageUrl: string): string[] {
  const unique = new Set<string>();
  for (const image of images) {
    try {
      const url = new URL(image, pageUrl);
      if (url.protocol === "https:") {
        unique.add(url.toString());
      }
    } catch {
      continue;
    }
  }
  return [...unique].slice(0, 10);
}

function normalizeStoreName(storeName: string | undefined): string | null {
  if (!storeName) {
    return null;
  }
  const trimmed = storeName.trim().slice(0, 80);
  return trimmed || null;
}

export function normalizeCaptured(raw: CapturedProduct): NormalizeResult {
  const parsed = capturedProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: "invalid_payload" };
  }
  const capture = parsed.data;
  const name = normalizeName(capture.name);
  if (!name) {
    return { ok: false, reason: "name_not_found" };
  }
  const images = normalizeImages(capture.images, capture.pageUrl);
  if (images.length === 0) {
    return { ok: false, reason: "no_image" };
  }
  const productUrl = normalizeProductUrl(capture.pageUrl, capture.canonicalUrl);
  if (!productUrl) {
    return { ok: false, reason: "invalid_payload" };
  }
  const priceResult = parsePriceText(capture.priceText, capture.currencyHint);
  if (!priceResult.ok) {
    return priceResult;
  }
  const variant = normalizeVariant(capture.variant);
  const variantKey = serializeVariantKey(variant);
  const storeDomain = resolveStoreDomain(productUrl);
  const product: NormalizedProduct = {
    name,
    images,
    productUrl,
    storeDomain,
    storeName: normalizeStoreName(capture.storeName),
    price: { amount: priceResult.amount, currency: priceResult.currency },
    variant,
    variantKey,
    source: { adapterId: capture.adapterId, trigger: capture.trigger },
  };
  const validated = normalizedProductSchema.safeParse(product);
  if (!validated.success) {
    return { ok: false, reason: "invalid_payload" };
  }
  return { ok: true, product: validated.data };
}

export { dedupeKeyForProduct } from "@/shared/dedupe-key";
