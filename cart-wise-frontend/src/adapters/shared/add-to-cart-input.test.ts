import { describe, expect, it } from "vitest";
import { isAddToCartLikeTarget } from "@/adapters/shared/add-to-cart-target";

describe("isAddToCartLikeTarget input", () => {
  it("reconhece input submit", () => {
    const input = document.createElement("input");
    input.type = "submit";
    input.value = "Buy now";
    expect(isAddToCartLikeTarget(input)).toBe(true);
  });
});
