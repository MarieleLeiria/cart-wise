import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  document.body.innerHTML = `
    <script type="application/ld+json">
      {"@type":"Product","name":"G","image":"https://cdn.example/g.jpg","offers":{"price":"9.99","priceCurrency":"BRL"}}
    </script>`;
  vi.stubGlobal("location", { href: "https://loja.example/p" });
});

describe("genericAdapter.extract", () => {
  it("extrai produto", async () => {
    const { genericAdapter } = await import("@/adapters/generic");
    const result = await genericAdapter.extract();
    expect(result.status).toBe("ok");
  });
});
