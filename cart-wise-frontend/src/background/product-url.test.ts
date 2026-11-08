import { describe, expect, it } from "vitest";
import { normalizeProductUrl } from "@/background/product-url";

describe("normalizeProductUrl", () => {
  it("ignora canonical de outro domínio", () => {
    const url = normalizeProductUrl(
      "https://www.amazon.com.br/dp/1",
      "https://evil.example/phish",
    );
    expect(url).toBe("https://www.amazon.com.br/dp/1");
  });

  it("FR-url remove utm e gclid", () => {
    const url = normalizeProductUrl("https://shop.example/p?gclid=abc&keep=1", undefined);
    expect(url).toBe("https://shop.example/p?keep=1");
  });
});
