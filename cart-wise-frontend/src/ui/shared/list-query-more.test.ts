import { describe, expect, it } from "vitest";
import type { SavedItem } from "@/shared/schemas";
import {
  applyListQuery,
  compareSavedItems,
  listEmptyMessage,
  uniqueCurrencies,
  uniqueStoreDomains,
} from "@/ui/shared/list-query";

function baseItem(id: string, overrides: Partial<SavedItem> = {}): SavedItem {
  return {
    id,
    dedupeKey: id,
    name: overrides.name ?? "Produto",
    images: ["https://cdn/x.jpg"],
    productUrl: "https://shop/x",
    storeDomain: overrides.storeDomain ?? "shop.example",
    storeName: "Shop",
    price: overrides.price ?? { amount: 100, currency: "BRL" },
    variant: {},
    variantKey: "",
    source: { adapterId: "generic", trigger: "manual" },
    capturedAt: "2026-01-01T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("applyListQuery sorting", () => {
  it("FR-LST-005 ordena preco crescente e desempata updatedAt", () => {
    const items = [
      baseItem("1", {
        price: { amount: 200, currency: "BRL" },
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
      baseItem("2", {
        price: { amount: 100, currency: "BRL" },
        updatedAt: "2026-01-03T00:00:00.000Z",
      }),
    ];
    const sorted = applyListQuery(items, { currency: "BRL", sort: "price-asc" });
    expect(sorted.map((i) => i.id)).toEqual(["2", "1"]);
  });

  it("FR-LST-004 busca por nome", () => {
    const items = [baseItem("1", { name: "Camisão" }), baseItem("2", { name: "Calça" })];
    const filtered = applyListQuery(items, {
      currency: "BRL",
      sort: "price-asc",
      search: "camisao",
    });
    expect(filtered).toHaveLength(1);
  });
});

describe("compareSavedItems", () => {
  it("FR-LST-005 desempata por id", () => {
    const a = baseItem("a", { price: { amount: 50, currency: "BRL" } });
    const b = baseItem("b", { price: { amount: 50, currency: "BRL" } });
    expect(compareSavedItems(a, b, "price-asc")).toBeLessThan(0);
  });
});

describe("listEmptyMessage", () => {
  it("FR-LST-006 mensagens de vazio", () => {
    expect(listEmptyMessage([], [], { currency: "BRL", sort: "price-asc" })).toBe(
      "Nenhum produto salvo.",
    );
  });
});

describe("unique helpers", () => {
  it("FR-LST-002 lista moedas", () => {
    const items = [
      baseItem("1", { price: { amount: 1, currency: "USD" } }),
      baseItem("2", { price: { amount: 1, currency: "BRL" } }),
    ];
    expect(uniqueCurrencies(items)).toEqual(["BRL", "USD"]);
    expect(uniqueStoreDomains(items, "BRL")).toEqual(["shop.example"]);
  });
});
