import { describe, expect, it } from "vitest";
import { isAddToCartLikeTarget } from "@/adapters/shared/add-to-cart-target";

describe("isAddToCartLikeTarget", () => {
  it("reconhece texto pt-BR", () => {
    const button = document.createElement("button");
    button.textContent = "Adicionar ao carrinho";
    expect(isAddToCartLikeTarget(button)).toBe(true);
  });
});
