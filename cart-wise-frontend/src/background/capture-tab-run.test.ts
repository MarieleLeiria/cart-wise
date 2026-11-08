import { describe, expect, it, vi } from "vitest";

describe("runCaptureOnTab", () => {
  it("injeta quando ping falha", async () => {
    vi.stubGlobal("chrome", {
      runtime: { getManifest: () => ({ content_scripts: [{ js: ["content.js"] }] }) },
      scripting: { executeScript: vi.fn(() => Promise.resolve([])) },
      tabs: {
        sendMessage: vi
          .fn()
          .mockRejectedValueOnce(new Error("no receiver"))
          .mockResolvedValueOnce({ type: "ITEM_CAPTURED", payload: {} }),
      },
    });
    const { runCaptureOnTab } = await import("@/background/capture-tab");
    const result = await runCaptureOnTab(4);
    expect(chrome.scripting.executeScript).toHaveBeenCalled();
    expect(result).toHaveProperty("type", "ITEM_CAPTURED");
  });
});
