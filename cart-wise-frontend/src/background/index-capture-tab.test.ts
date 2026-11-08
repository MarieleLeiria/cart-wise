import { beforeEach, describe, expect, it, vi } from "vitest";

const listeners: Array<
  (raw: unknown, sender: unknown, sendResponse: (r: unknown) => void) => boolean
> = [];

beforeEach(() => {
  listeners.length = 0;
  vi.stubGlobal("chrome", {
    action: {
      setBadgeText: vi.fn(),
      setBadgeBackgroundColor: vi.fn(),
    },
    permissions: {
      contains: vi.fn(() => Promise.resolve(true)),
      request: vi.fn(() => Promise.resolve(true)),
    },
    scripting: {
      executeScript: vi.fn(() => Promise.resolve([])),
    },
    runtime: {
      id: "cart-wise-ext",
      onMessage: {
        addListener: (fn: (typeof listeners)[number]) => listeners.push(fn),
      },
      getManifest: () => ({ content_scripts: [{ js: ["content.js"] }] }),
    },
    tabs: {
      get: vi.fn(() => Promise.resolve({ url: "https://shop.example/p" })),
      sendMessage: vi
        .fn()
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false, reason: "price_not_found" }),
    },
  });
});

describe("CAPTURE_ACTIVE_TAB https", () => {
  it("propaga resposta do content", async () => {
    vi.resetModules();
    await import("@/background/index");
    const response = await new Promise((resolve) => {
      listeners.at(-1)?.(
        { type: "CAPTURE_ACTIVE_TAB", tabId: 2, source: "popup" },
        { id: "cart-wise-ext", url: "chrome-extension://cart-wise/popup.html" },
        resolve,
      );
    });
    expect(response).toEqual({ ok: false, reason: "price_not_found" });
  });
});
