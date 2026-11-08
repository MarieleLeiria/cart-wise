import { describe, expect, it } from "vitest";
import { parsePriceText } from "@/background/price-parser";

describe("parsePriceText", () => {
  it("FR-entities R$ 1.299,90 vira 129990 BRL", () => {
    const parsed = parsePriceText("R$ 1.299,90");
    expect(parsed).toEqual({ ok: true, amount: 129990, currency: "BRL" });
  });

  it("FR-entities R$ 10 vira 1000 BRL", () => {
    const parsed = parsePriceText("R$ 10");
    expect(parsed).toEqual({ ok: true, amount: 1000, currency: "BRL" });
  });

  it("FR-entities moeda desconhecida retorna currency_unknown", () => {
    const parsed = parsePriceText("10.00");
    expect(parsed).toEqual({ ok: false, reason: "currency_unknown" });
  });
});
