import { beforeEach, describe, expect, it, vi } from "vitest";

describe("mountSaveFab", () => {
  beforeEach(() => {
    document.documentElement.innerHTML = "";
    vi.stubGlobal("chrome", {
      runtime: {
        sendMessage: vi.fn(() => Promise.resolve({ ok: true, created: true, name: "X" })),
      },
    });
    vi.stubGlobal("location", { href: "https://loja.example/p" });
    document.body.innerHTML = `
      <script type="application/ld+json">
        {"@type":"Product","name":"Produto","image":"https://cdn.example/p.jpg","offers":{"price":"10.00","priceCurrency":"BRL"}}
      </script>
    `;
  });

  it("FR-site monta botão flutuante", async () => {
    const { mountSaveFab } = await import("@/content/save-button");
    mountSaveFab();
    expect(document.getElementById("cartwise-save-host")).toBeTruthy();
    mountSaveFab();
    expect(document.querySelectorAll("#cartwise-save-host")).toHaveLength(1);
  });
});
