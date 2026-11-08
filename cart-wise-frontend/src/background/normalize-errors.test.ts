import { describe, expect, it } from "vitest";
import { normalizeCaptured } from "@/background/normalize";
import type { CapturedProduct } from "@/shared/schemas";

const base: CapturedProduct = {
  name: "Item",
  images: ["https://cdn.example/i.jpg"],
  pageUrl: "https://shop.example/p",
  priceText: "R$ 10,00",
  variant: {},
  adapterId: "generic",
  trigger: "manual",
};

describe("normalizeCaptured failures", () => {
  it("FR-entities name_not_found", () => {
    const result = normalizeCaptured({ ...base, name: "   " });
    expect(result).toEqual({ ok: false, reason: "name_not_found" });
  });

  it("FR-entities no_image", () => {
    const result = normalizeCaptured({ ...base, images: ["http://shop.example/insecure.jpg"] });
    expect(result).toEqual({ ok: false, reason: "no_image" });
  });

  it("FR-entities invalid_payload sem https", () => {
    const result = normalizeCaptured({
      ...base,
      pageUrl: "http://shop.example/p",
      images: ["http://shop.example/i.jpg"],
    });
    expect(result.ok).toBe(false);
  });
});
