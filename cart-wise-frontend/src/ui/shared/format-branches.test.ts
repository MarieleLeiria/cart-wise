import { describe, expect, it } from "vitest";
import { formatVariantLabel } from "@/ui/shared/format";

describe("formatVariantLabel empty", () => {
  it("retorna string vazia", () => {
    expect(formatVariantLabel({})).toBe("");
  });
});
