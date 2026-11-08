import { describe, expect, it } from "vitest";
import { buildDedupeKey } from "@/shared/dedupe-key";

describe("buildDedupeKey", () => {
  it("FR-dedupe escapa pipe nas partes", () => {
    const key = buildDedupeKey("a|b", "https://x", "");
    expect(key).toBe("a%7Cb|https://x|");
  });
});
