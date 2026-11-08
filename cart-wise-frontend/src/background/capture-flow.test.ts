import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ItemCapturedMessage } from "@/shared/messages";

const message: ItemCapturedMessage = {
  type: "ITEM_CAPTURED",
  payload: {
    name: "Produto",
    images: ["https://cdn.example/i.jpg"],
    pageUrl: "https://shop.example/p",
    priceText: "R$ 10,00",
    currencyHint: "BRL",
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

describe("persistFromCapture", () => {
  it("grava item válido", async () => {
    vi.resetModules();
    const { persistFromCapture } = await import("@/background/capture-flow");
    const result = await persistFromCapture(message);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.name).toBe("Produto");
    }
  });
});
