import { describe, expect, it, vi } from "vitest";

describe("captureActiveTab catch", () => {
  it("adapter_error quando tabs.get falha", async () => {
    vi.stubGlobal("chrome", {
      tabs: {
        get: vi.fn(() => Promise.reject(new Error("tab gone"))),
      },
    });
    vi.resetModules();
    const { captureActiveTab } = await import("@/background/capture-tab");
    const result = await captureActiveTab({
      type: "CAPTURE_ACTIVE_TAB",
      tabId: 1,
      source: "popup",
    });
    expect(result).toEqual({ ok: false, reason: "adapter_error" });
  });
});
