import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  document.getElementById("cartwise-toast-host")?.remove();
  document.body.innerHTML = `
    <script type="application/ld+json">
      {"@type":"Product","name":"X","image":"https://cdn.example/x.jpg","offers":{"price":"12","priceCurrency":"BRL"}}
    </script>`;
  vi.stubGlobal("location", { href: "https://www.amazon.com.br/dp/x" });
  vi.stubGlobal("chrome", {
    runtime: {
      sendMessage: vi.fn(() => Promise.resolve({ ok: false, reason: "storage_error" })),
    },
  });
});

describe("performCapture sw failure", () => {
  it("retorna falha do service worker", async () => {
    const { performCapture } = await import("@/content/capture");
    const result = await performCapture("auto");
    expect(result).toEqual({ ok: false, reason: "storage_error" });
  });
});
