import { resolveStoreDomain } from "@/background/store-domain";

const TRACKING_PARAMS = new Set([
  "gclid",
  "fbclid",
  "msclkid",
  "srsltid",
  "mc_cid",
  "mc_eid",
  "gbraid",
  "wbraid",
  "yclid",
  "twclid",
]);

export function normalizeProductUrl(
  pageUrl: string,
  canonicalUrl: string | undefined,
): string | null {
  const pageDomain = resolveStoreDomain(pageUrl);
  const canonicalOk =
    Boolean(canonicalUrl?.startsWith("https://")) &&
    resolveStoreDomain(canonicalUrl!) === pageDomain;
  const base = canonicalOk ? canonicalUrl! : pageUrl;
  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") {
    return null;
  }
  parsed.hash = "";
  if (parsed.port === "443") {
    parsed.port = "";
  }
  const kept = new URLSearchParams();
  for (const [key, value] of parsed.searchParams) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_")) {
      continue;
    }
    if (TRACKING_PARAMS.has(lower)) {
      continue;
    }
    kept.set(key, value);
  }
  parsed.search = kept.toString() ? `?${kept.toString()}` : "";
  return parsed.toString();
}
