import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  document.getElementById("cartwise-toast-host")?.remove();
  document.body.innerHTML = `
    <script type="application/ld+json">
      {"@type":"Product","name":"X","image":"https://cdn.example/x.jpg","offers":{"price":"12","priceCurrency":"BRL"}}
    </script>`;
  vi.stubGlobal("location", { href: "https://www.amazon.com.br/dp/x" });
  vi.stubGlobal("chrome", {
    runtime: { sendMessage: vi.fn(() => Promise.resolve({ ok: true, created: true, name: "X" })) },
  });
});

describe("performCapture", () => {
  it("manual com skipServiceWorker retorna ITEM_CAPTURED", async () => {
    vi.resetModules();
    const { performCapture } = await import("@/content/capture");
    const result = await performCapture("manual", { skipServiceWorker: true });
    expect(result).toMatchObject({ type: "ITEM_CAPTURED", payload: { name: "X" } });
  });

  it("falha sem produto", async () => {
    document.body.innerHTML = "";
    vi.resetModules();
    const { performCapture } = await import("@/content/capture");
    const result = await performCapture("manual", { skipServiceWorker: true });
    expect(result).toEqual({ ok: false, reason: "adapter_error" });
  });

  it("auto chama service worker", async () => {
    vi.resetModules();
    const { performCapture } = await import("@/content/capture");
    await performCapture("auto");
    expect(chrome.runtime.sendMessage).toHaveBeenCalled();
  });
});
