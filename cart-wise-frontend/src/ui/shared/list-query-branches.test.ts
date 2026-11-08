import { describe, expect, it } from "vitest";
import type { SavedItem } from "@/shared/schemas";
import { applyListQuery, compareSavedItems } from "@/ui/shared/list-query";

const base = (partial: Partial<SavedItem>): SavedItem => ({
  id: partial.id ?? "1",
  dedupeKey: "k",
  name: partial.name ?? "Produto",
  images: ["https://cdn/x.jpg"],
  productUrl: "https://shop/x",
  storeDomain: partial.storeDomain ?? "alpha.example",
  storeName: null,
  price: partial.price ?? { amount: 100, currency: "BRL" },
  variant: {},
  variantKey: "",
  source: { adapterId: "generic", trigger: "manual" },
  capturedAt: "2026-01-01T00:00:00.000Z",
  updatedAt: partial.updatedAt ?? "2026-01-02T00:00:00.000Z",
  ...partial,
});

describe("list-query branches", () => {
  it("filtra por storeDomain", () => {
    const items = [
      base({ id: "1", storeDomain: "a.example" }),
      base({ id: "2", storeDomain: "b.example" }),
    ];
    const result = applyListQuery(items, {
      currency: "BRL",
      storeDomain: "b.example",
      sort: "price-desc",
    });
    expect(result).toHaveLength(1);
  });

  it("compareSavedItems price-desc e empate updatedAt", () => {
    const a = base({
      id: "a",
      price: { amount: 50, currency: "BRL" },
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const b = base({
      id: "b",
      price: { amount: 50, currency: "BRL" },
      updatedAt: "2026-01-03T00:00:00.000Z",
    });
    expect(compareSavedItems(a, b, "price-desc")).toBeGreaterThan(0);
  });
});
