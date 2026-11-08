import { describe, expect, it } from "vitest";
import type { SavedItem } from "@/shared/schemas";
import { listEmptyMessage, resolveDefaultCurrency } from "@/ui/shared/list-query";

const item = (id: string, currency: string, updatedAt: string): SavedItem => ({
  id,
  dedupeKey: id,
  name: "P",
  images: ["https://cdn/x.jpg"],
  productUrl: "https://shop/x",
  storeDomain: "shop.example",
  storeName: null,
  price: { amount: 1, currency },
  variant: {},
  variantKey: "",
  source: { adapterId: "generic", trigger: "manual" },
  capturedAt: updatedAt,
  updatedAt,
});

describe("resolveDefaultCurrency", () => {
  it("FR-LST-002 escolhe moeda do item mais recente", () => {
    const items = [
      item("1", "BRL", "2026-01-01T00:00:00.000Z"),
      item("2", "USD", "2026-01-03T00:00:00.000Z"),
    ];
    expect(resolveDefaultCurrency(items)).toBe("USD");
  });
});

describe("listEmptyMessage branches", () => {
  it("FR-LST-006 retorna null com itens visiveis", () => {
    const items = [item("1", "BRL", "2026-01-01T00:00:00.000Z")];
    expect(listEmptyMessage(items, items, { currency: "BRL", sort: "price-asc" })).toBeNull();
  });
});
