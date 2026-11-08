import { describe, expect, it, vi } from "vitest";

describe("registerAutoCaptureListener", () => {
  it("registra listener em loja MVP", async () => {
    vi.stubGlobal("location", { href: "https://www.amazon.com.br/dp/x" });
    const add = vi.spyOn(document, "addEventListener");
    vi.resetModules();
    const { registerAutoCaptureListener } = await import("@/content/auto-capture");
    registerAutoCaptureListener();
    expect(add).toHaveBeenCalledWith("click", expect.any(Function), true);
    add.mockRestore();
  });
});
