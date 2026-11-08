import { describe, expect, it, vi } from "vitest";

describe("captureActiveTab denied", () => {
  it("pede permissão em site novo", async () => {
    vi.stubGlobal("chrome", {
      permissions: {
        contains: vi.fn(() => Promise.resolve(false)),
        request: vi.fn(() => Promise.resolve(false)),
      },
      tabs: {
        get: vi.fn(() => Promise.resolve({ url: "https://novaloja.example/p" })),
      },
    });
    vi.resetModules();
    const { captureActiveTab } = await import("@/background/capture-tab");
    const result = await captureActiveTab({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(result).toEqual({ ok: false, permission: "denied" });
  });
});
