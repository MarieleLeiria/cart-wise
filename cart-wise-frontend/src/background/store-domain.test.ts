import { describe, expect, it } from "vitest";
import { resolveStoreDomain } from "@/background/store-domain";

describe("resolveStoreDomain", () => {
  it("FR-entities amazon.com.br permanece", () => {
    expect(resolveStoreDomain("https://www.amazon.com.br/dp/1")).toBe("amazon.com.br");
  });

  it("FR-entities host simples", () => {
    expect(resolveStoreDomain("https://loja.example/p")).toBe("loja.example");
  });

  it("FR-entities co.uk", () => {
    expect(resolveStoreDomain("https://shop.example.co.uk/p")).toBe("example.co.uk");
  });
});
