import { describe, expect, it } from "vitest";
import { normalizeVariant, serializeVariantKey } from "@/background/variant-key";

describe("serializeVariantKey", () => {
  it("FR-entities ordena chaves e normaliza", () => {
    const key = serializeVariantKey({ Color: "Azul", Size: "M" });
    expect(key).toBe("color=azul,size=m");
  });

  it("FR-entities variant vazio", () => {
    expect(serializeVariantKey(normalizeVariant({}))).toBe("");
  });
});
