type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function asObject(value: JsonValue): JsonObject | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  return null;
}

function collectNodes(node: JsonValue, out: JsonObject[]): void {
  if (!node) {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectNodes(item, out);
    }
    return;
  }
  const obj = asObject(node);
  if (!obj) {
    return;
  }
  const type = obj["@type"];
  const types = Array.isArray(type) ? type : type ? [type] : [];
  if (types.some((t) => (typeof t === "string" ? t : "").toLowerCase() === "product")) {
    out.push(obj);
  }
  if (obj["@graph"]) {
    collectNodes(obj["@graph"], out);
  }
}

export function readJsonLdProducts(doc: Document): JsonObject[] {
  const products: JsonObject[] = [];
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    const text = script.textContent?.trim();
    if (!text) {
      continue;
    }
    try {
      const parsed = JSON.parse(text) as JsonValue;
      collectNodes(parsed, products);
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  return products;
}

export function productOffer(product: JsonObject): JsonObject | null {
  const offers = product.offers;
  if (Array.isArray(offers)) {
    return asObject(offers[0] ?? null);
  }
  return asObject(offers);
}
