import { describe, expect, it } from "vitest";
import { normalizeCaptured } from "@/background/normalize";
import { normalizeProductUrl } from "@/background/product-url";
import { parsePriceText } from "@/background/price-parser";
import { resolveStoreDomain } from "@/background/store-domain";

describe("branch coverage helpers", () => {
  it("store-domain host curto", () => {
    expect(resolveStoreDomain("https://shop.example")).toBe("shop.example");
  });

  it("product-url usa canonical https", () => {
    const url = normalizeProductUrl("https://shop.example/p", "https://shop.example/canonical");
    expect(url).toBe("https://shop.example/canonical");
  });

  it("price-parser USD com hint", () => {
    const parsed = parsePriceText("$1,299.90", "USD");
    expect(parsed).toMatchObject({ ok: true, currency: "USD" });
  });

  it("normalize storeName vazio vira null", () => {
    const result = normalizeCaptured({
      name: "Item",
      images: ["https://cdn.example/i.jpg"],
      pageUrl: "https://shop.example/p",
      canonicalUrl: "https://shop.example/canonical",
      priceText: "R$ 5,00",
      storeName: "   ",
      variant: { Color: "X" },
      adapterId: "generic",
      trigger: "auto",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.product.storeName).toBeNull();
    }
  });
});
