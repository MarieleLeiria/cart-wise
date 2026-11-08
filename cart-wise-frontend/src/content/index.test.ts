import { describe, expect, it, vi, beforeEach } from "vitest";

const listeners: Array<
  (raw: unknown, sender: unknown, sendResponse: (r: unknown) => void) => boolean | void
> = [];

describe("content onMessage", () => {
  beforeEach(() => {
    listeners.length = 0;
    document.body.innerHTML = `
      <script type="application/ld+json">
        {"@type":"Product","name":"Produto","image":"https://cdn.example/p.jpg","offers":{"price":"10.00","priceCurrency":"BRL"}}
      </script>
    `;
    vi.stubGlobal("location", { href: "https://www.amazon.com.br/dp/1" });
    vi.stubGlobal("chrome", {
      runtime: {
        onMessage: {
          addListener: (fn: (typeof listeners)[number]) => listeners.push(fn),
        },
        sendMessage: vi.fn(() => Promise.resolve({ ok: true, created: true, name: "Produto" })),
      },
    });
  });

  it("FR-msg RUN_CAPTURE retorna ITEM_CAPTURED", async () => {
    vi.resetModules();
    await import("@/content/index");
    const response = await new Promise((resolve) => {
      listeners.at(-1)?.({ type: "RUN_CAPTURE", trigger: "manual" }, {}, resolve);
    });
    expect(response).toMatchObject({
      type: "ITEM_CAPTURED",
      payload: { name: "Produto" },
    });
  });
});
