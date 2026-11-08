import { describe, expect, it } from "vitest";
import { showCaptureToast } from "@/content/toast";

describe("showCaptureToast", () => {
  it("cria host com shadow fechado", () => {
    showCaptureToast("Produto salvo.");
    const host = document.getElementById("cartwise-toast-host");
    expect(host).not.toBeNull();
    host?.remove();
  });
});
