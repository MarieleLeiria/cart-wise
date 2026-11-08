import { describe, expect, it } from "vitest";
import { showCaptureToast } from "@/content/toast";

describe("showCaptureToast replace", () => {
  it("substitui toast anterior", () => {
    showCaptureToast("Um");
    showCaptureToast("Dois");
    expect(document.getElementById("cartwise-toast-host")).not.toBeNull();
    document.getElementById("cartwise-toast-host")?.remove();
  });
});
