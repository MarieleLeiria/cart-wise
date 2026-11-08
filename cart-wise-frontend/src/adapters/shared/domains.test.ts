import { describe, expect, it } from "vitest";
import { registrableDomainFromUrl, urlMatchesDomain } from "@/adapters/shared/domains";

describe("domains", () => {
  it("mvp e url inválida", () => {
    expect(urlMatchesDomain("https://www.amazon.com.br/x", "amazon.com.br")).toBe(true);
    expect(registrableDomainFromUrl("not-a-url")).toBeNull();
  });
});
