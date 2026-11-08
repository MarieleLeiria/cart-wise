import { describe, expect, it, vi } from "vitest";

describe("captureActiveTab not_https", () => {
  it("bloqueia http", async () => {
    vi.stubGlobal("chrome", {
      tabs: { get: vi.fn(() => Promise.resolve({ url: "http://insecure.example" })) },
    });
    vi.resetModules();
    const { captureActiveTab } = await import("@/background/capture-tab");
    const result = await captureActiveTab({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(result).toEqual({ ok: false, permission: "not_https" });
  });
});
