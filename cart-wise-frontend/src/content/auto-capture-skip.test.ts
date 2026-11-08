import { describe, expect, it, vi } from "vitest";

describe("registerAutoCaptureListener skip", () => {
  it("não registra fora do MVP", async () => {
    vi.stubGlobal("location", { href: "https://outraloja.example/p" });
    const add = vi.spyOn(document, "addEventListener");
    vi.resetModules();
    const { registerAutoCaptureListener } = await import("@/content/auto-capture");
    registerAutoCaptureListener();
    expect(add).not.toHaveBeenCalled();
    add.mockRestore();
  });
});
