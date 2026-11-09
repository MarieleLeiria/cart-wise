import { describe, expect, it } from "vitest";
import { hostnameForUrl, originPatternForUrl } from "@/shared/site-origin";

describe("site-origin invalid", () => {
  it("FR-site rejeita URL inválida", () => {
    expect(originPatternForUrl("not-a-url")).toBeNull();
    expect(hostnameForUrl("not-a-url")).toBeNull();
  });
});
