import { describe, expect, it } from "vitest";
import { capturedProductSchema, normalizedProductSchema } from "@/shared/schemas";

describe("capturedProductSchema", () => {
  it("FR-schema aceita payload valido", () => {
    const result = capturedProductSchema.safeParse({
      name: "Camisa",
      images: ["https://cdn.example/item.jpg"],
      pageUrl: "https://shop.example/p",
      priceText: "R$ 10,00",
      variant: {},
      adapterId: "generic",
      trigger: "manual",
    });
    expect(result.success).toBe(true);
  });
});

describe("normalizedProductSchema", () => {
  it("FR-schema rejeita preco negativo", () => {
    const result = normalizedProductSchema.safeParse({
      name: "X",
      images: ["https://cdn.example/i.jpg"],
      productUrl: "https://shop.example/p",
      storeDomain: "shop.example",
      storeName: null,
      price: { amount: -1, currency: "BRL" },
      variant: {},
      variantKey: "",
      source: { adapterId: "generic", trigger: "manual" },
    });
    expect(result.success).toBe(false);
  });
});
