import { describe, expect, it } from "vitest";
import { popupMessageFor, toastMessageFor } from "@/shared/capture-messages";

describe("capture-messages", () => {
  it("toast de sucesso", () => {
    expect(
      toastMessageFor({ kind: "success", created: true, name: "X" }),
    ).toBe("Produto salvo.");
  });

  it("popup de permissão", () => {
    expect(popupMessageFor({ kind: "permission", permission: "denied" })).toContain(
      "Sem permissão",
    );
    expect(toastMessageFor({ kind: "permission", permission: "denied" })).toBeNull();
  });
});
