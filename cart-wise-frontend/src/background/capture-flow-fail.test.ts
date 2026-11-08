import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ItemCapturedMessage } from "@/shared/messages";

const invalidCurrency: ItemCapturedMessage = {
  type: "ITEM_CAPTURED",
  payload: {
    name: "Produto",
    images: ["https://cdn.example/i.jpg"],
    pageUrl: "https://shop.example/p",
    priceText: "???",
    variant: {},
    adapterId: "generic",
    trigger: "manual",
  },
};

beforeEach(() => {
  vi.stubGlobal("chrome", {
    action: { setBadgeText: vi.fn(), setBadgeBackgroundColor: vi.fn() },
    tabs: { sendMessage: vi.fn() },
  });
});

describe("persistFromCapture failure", () => {
  it("currency_unknown", async () => {
    vi.resetModules();
    const { persistFromCapture } = await import("@/background/capture-flow");
    const result = await persistFromCapture(invalidCurrency);
    expect(result).toEqual({ ok: false, reason: "currency_unknown" });
  });
});
