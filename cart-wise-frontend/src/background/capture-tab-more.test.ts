import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ItemCapturedMessage } from "@/shared/messages";

const captured: ItemCapturedMessage = {
  type: "ITEM_CAPTURED",
  payload: {
    name: "Produto",
    images: ["https://cdn.example/i.jpg"],
    pageUrl: "https://www.amazon.com.br/dp/1",
    priceText: "10",
    variant: {},
    adapterId: "generic",
    trigger: "manual",
  },
};

beforeEach(() => {
  vi.stubGlobal("chrome", {
    permissions: {
      contains: vi.fn(() => Promise.resolve(true)),
      request: vi.fn(() => Promise.resolve(true)),
    },
    scripting: { executeScript: vi.fn(() => Promise.resolve([])) },
    runtime: { getManifest: () => ({ content_scripts: [{ js: ["content.js"] }] }) },
    tabs: {
      get: vi.fn(() => Promise.resolve({ url: "https://www.amazon.com.br/dp/1" })),
      sendMessage: vi
        .fn()
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce(captured),
    },
  });
});

describe("captureActiveTab ok", () => {
  it("retorna ITEM_CAPTURED", async () => {
    vi.resetModules();
    const { captureActiveTab } = await import("@/background/capture-tab");
    const result = await captureActiveTab({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 3,
      source: "popup",
    });
    expect(result).toEqual(captured);
  });
});
