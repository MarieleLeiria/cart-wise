import { describe, expect, it } from "vitest";
import { runtimeMessageSchema } from "@/shared/messages";

describe("runtimeMessageSchema", () => {
  it("FR-msg valida CAPTURE_ACTIVE_TAB", () => {
    const parsed = runtimeMessageSchema.safeParse({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(parsed.success).toBe(true);
  });

  it("FR-msg valida ACTIVATE_SITE", () => {
    const parsed = runtimeMessageSchema.safeParse({
      type: "ACTIVATE_SITE",
      tabId: 1,
      url: "https://loja.example/p",
    });
    expect(parsed.success).toBe(true);
  });

  it("FR-msg rejeita tipo desconhecido", () => {
    const parsed = runtimeMessageSchema.safeParse({
      type: "UNKNOWN",
    });
    expect(parsed.success).toBe(false);
  });
});
