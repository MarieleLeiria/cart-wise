import { describe, expect, it } from "vitest";
import { dedupeKeyForProduct } from "@/shared/dedupe-key";
import type { NormalizedProduct } from "@/shared/schemas";

describe("dedupeKeyForProduct", () => {
  it("FR-dedupe compoe partes", () => {
    const product = {
      storeDomain: "amazon.com.br",
      productUrl: "https://amazon.com.br/x",
      variantKey: "size=m",
    } as NormalizedProduct;
    expect(dedupeKeyForProduct(product)).toBe("amazon.com.br|https://amazon.com.br/x|size=m");
  });
});
