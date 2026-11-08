import { describe, expect, it } from "vitest";
import type { SavedItem } from "@/shared/schemas";
import {
  applyListQuery,
  normalizeSearchText,
  resolveDefaultCurrency,
  sortByUpdatedAtDesc,
} from "@/ui/shared/list-query";

function item(partial: Partial<SavedItem> & Pick<SavedItem, "id" | "name" | "price">): SavedItem {
  return {
    id: partial.id,
    dedupeKey: partial.dedupeKey ?? partial.id,
    name: partial.name,
    images: partial.images ?? ["https://cdn/x.jpg"],
    productUrl: partial.productUrl ?? "https://shop/x",
    storeDomain: partial.storeDomain ?? "shop.example",
    storeName: partial.storeName ?? "Shop",
    price: partial.price,
    variant: partial.variant ?? {},
    variantKey: partial.variantKey ?? "",
    source: partial.source ?? { adapterId: "generic", trigger: "manual" },
    capturedAt: partial.capturedAt ?? "2026-01-01T00:00:00.000Z",
    updatedAt: partial.updatedAt ?? "2026-01-02T00:00:00.000Z",
  };
}

describe("normalizeSearchText", () => {
  it("FR-LST-004 ignora acentos", () => {
    expect(normalizeSearchText("Camisão")).toBe("camisao");
  });
});

describe("applyListQuery", () => {
  it("FR-LST-002 filtra por moeda", () => {
    const items = [
      item({ id: "1", name: "A", price: { amount: 100, currency: "BRL" } }),
      item({ id: "2", name: "B", price: { amount: 100, currency: "USD" } }),
    ];
    const visible = applyListQuery(items, { currency: "USD", sort: "price-asc" });
    expect(visible).toHaveLength(1);
    expect(visible[0]?.price.currency).toBe("USD");
  });
});

describe("sortByUpdatedAtDesc", () => {
  it("FR-LST-008 ordena por updatedAt", () => {
    const items = [
      item({
        id: "1",
        name: "A",
        price: { amount: 100, currency: "BRL" },
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
      item({
        id: "2",
        name: "B",
        price: { amount: 50, currency: "BRL" },
        updatedAt: "2026-02-01T00:00:00.000Z",
      }),
    ];
    const sorted = sortByUpdatedAtDesc(items);
    expect(sorted[0]?.id).toBe("2");
  });
});

describe("resolveDefaultCurrency", () => {
  it("FR-LST-002 usa BRL quando vazio", () => {
    expect(resolveDefaultCurrency([])).toBe("BRL");
  });
});
