import { describe, expect, it } from "vitest";
import { createStoreAdapter } from "@/adapters/shared/create-store-adapter";

describe("createStoreAdapter", () => {
  it("matches domínio", () => {
    const adapter = createStoreAdapter({ id: "amazon-com-br", domain: "amazon.com.br" });
    expect(adapter.matches("https://www.amazon.com.br/dp/1")).toBe(true);
    expect(adapter.isAddToCartTarget?.(Object.assign(document.createElement("button"), {
      innerText: "Adicionar ao carrinho",
    }))).toBe(true);
  });
});
