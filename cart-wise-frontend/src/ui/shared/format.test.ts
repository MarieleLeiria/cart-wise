import { describe, expect, it } from "vitest";
import { formatPrice, formatStoreLabel, formatVariantLabel } from "@/ui/shared/format";
import type { SavedItem } from "@/shared/schemas";

describe("formatVariantLabel", () => {
  it("FR-LST-001 junta variantes", () => {
    expect(formatVariantLabel({ color: "azul", size: "m" })).toBe("azul · m");
  });
});

describe("formatStoreLabel", () => {
  it("FR-LST-001 usa storeName ou domain", () => {
    const withName = { storeName: "Shein", storeDomain: "shein.com" } as SavedItem;
    expect(formatStoreLabel(withName)).toBe("Shein");
    const withoutName = { storeName: null, storeDomain: "shein.com" } as SavedItem;
    expect(formatStoreLabel(withoutName)).toBe("shein.com");
  });
});

describe("formatPrice", () => {
  it("FR-LST-007 formata BRL", () => {
    expect(formatPrice(4990, "BRL")).toContain("49");
  });
});
