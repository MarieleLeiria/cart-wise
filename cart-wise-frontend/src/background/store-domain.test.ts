import { describe, expect, it } from "vitest";
import { resolveStoreDomain } from "@/background/store-domain";

describe("resolveStoreDomain", () => {
  it("FR-entities amazon.com.br permanece", () => {
    expect(resolveStoreDomain("https://www.amazon.com.br/dp/1")).toBe("amazon.com.br");
  });
});
