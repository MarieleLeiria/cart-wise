import { describe, expect, it } from "vitest";
import { popupMessageFor, toastMessageFor } from "@/shared/capture-messages";

describe("capture-messages branches", () => {
  it("sucesso atualizado", () => {
    expect(toastMessageFor({ kind: "success", created: false, name: "X" })).toBe(
      "Produto atualizado.",
    );
  });

  it("falha", () => {
    expect(popupMessageFor({ kind: "failure", reason: "price_not_found" })).toContain("preço");
  });
});
