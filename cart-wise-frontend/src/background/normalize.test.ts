import { describe, expect, it } from "vitest";
import { normalizeCaptured } from "@/background/normalize";
import type { CapturedProduct } from "@/shared/schemas";

const sample: CapturedProduct = {
  name: "  Camisa ",
  images: ["/img.jpg"],
  pageUrl: "https://www.amazon.com.br/dp/123?utm_source=x",
  priceText: "R$ 49,90",
  variant: { color: "azul" },
  adapterId: "generic",
  trigger: "manual",
};

describe("normalizeCaptured", () => {
  it("FR-normalize produz SavedItem campos basicos", () => {
    const result = normalizeCaptured({
      ...sample,
      images: ["https://m.media-amazon.com/images/item.jpg"],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.product.price.amount).toBe(4990);
    expect(result.product.variantKey).toContain("color=");
    expect(result.product.productUrl).not.toContain("utm_source");
  });
});
