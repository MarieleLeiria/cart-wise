import { describe, expect, it } from "vitest";
import {
  contentScriptIdForPattern,
  hostnameForUrl,
  originPatternForUrl,
} from "@/shared/site-origin";

describe("site-origin", () => {
  it("FR-site originPatternForUrl HTTPS", () => {
    expect(originPatternForUrl("https://www.loja.example/p")).toBe(
      "https://www.loja.example/*",
    );
    expect(originPatternForUrl("http://loja.example/p")).toBeNull();
  });

  it("FR-site hostnameForUrl", () => {
    expect(hostnameForUrl("https://Loja.Example/x")).toBe("loja.example");
  });

  it("FR-site contentScriptIdForPattern estável", () => {
    const id = contentScriptIdForPattern("https://loja.example/*");
    expect(id).toMatch(/^cartwise-/);
  });
});
