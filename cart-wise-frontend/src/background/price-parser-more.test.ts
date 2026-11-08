import { describe, expect, it } from "vitest";
import { parsePriceText, resolveCurrency } from "@/background/price-parser";

describe("resolveCurrency", () => {
  it("FR-entities usa currencyHint USD", () => {
    expect(resolveCurrency("$1.00", "USD")).toBe("USD");
  });
});

describe("parsePriceText edge", () => {
  it("FR-entities invalid_payload vazio", () => {
    expect(parsePriceText("R$")).toEqual({ ok: false, reason: "invalid_payload" });
  });
});
