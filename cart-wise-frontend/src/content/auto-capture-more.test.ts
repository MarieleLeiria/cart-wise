import { describe, expect, it, vi } from "vitest";

describe("auto capture click", () => {
  it("dispara performCapture", async () => {
    vi.stubGlobal("location", { href: "https://www.amazon.com.br/dp/x" });
    document.body.innerHTML = `<button id="buy">Adicionar ao carrinho</button>
      <script type="application/ld+json">{"@type":"Product","name":"P","image":"https://cdn.example/p.jpg","offers":{"price":"1","priceCurrency":"BRL"}}</script>`;
    vi.stubGlobal("chrome", {
      runtime: { sendMessage: vi.fn(() => Promise.resolve({ ok: true, created: true, name: "P" })) },
    });
    vi.resetModules();
    const { registerAutoCaptureListener } = await import("@/content/auto-capture");
    registerAutoCaptureListener();
    const button = document.getElementById("buy");
    button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(chrome.runtime.sendMessage).toHaveBeenCalled();
  });
});
