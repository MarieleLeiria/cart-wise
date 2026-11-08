export function normalizeVariant(variant: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(variant)) {
    const key = rawKey.trim().toLowerCase().replace(/\s+/g, " ");
    const value = rawValue.trim().toLowerCase().replace(/\s+/g, " ");
    if (key && value) {
      out[key] = value;
    }
  }
  return out;
}

export function serializeVariantKey(variant: Record<string, string>): string {
  const normalized = normalizeVariant(variant);
  const keys = Object.keys(normalized).sort();
  if (keys.length === 0) {
    return "";
  }
  return keys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(normalized[key] ?? "")}`)
    .join(",");
}
