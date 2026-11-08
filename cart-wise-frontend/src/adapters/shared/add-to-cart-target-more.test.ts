import { describe, expect, it } from "vitest";
import { findAddToCartTargetFromEvent } from "@/adapters/shared/add-to-cart-target";

describe("findAddToCartTargetFromEvent", () => {
  it("sobe na árvore DOM", () => {
    const outer = document.createElement("div");
    const button = document.createElement("button");
    button.textContent = "Add to cart";
    outer.appendChild(button);
    const span = document.createElement("span");
    button.appendChild(span);
    document.body.appendChild(outer);
    const found = findAddToCartTargetFromEvent(span);
    expect(found).toBe(button);
    outer.remove();
  });
});
