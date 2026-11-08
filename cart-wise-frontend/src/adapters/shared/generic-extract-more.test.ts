import { describe, expect, it } from "vitest";
import { extractGenericFromFixtureHtml } from "@/adapters/shared/generic-extract";

describe("generic-extract failures", () => {
  it("name_not_found", async () => {
    const result = await extractGenericFromFixtureHtml(
      "<html><body></body></html>",
      "https://loja.example/p",
    );
    expect(result).toEqual({ status: "fail", reason: "name_not_found" });
  });

  it("no_image", async () => {
    const html = `<html><head><script type="application/ld+json">{"@type":"Product","name":"Sem foto","offers":{"price":"1","priceCurrency":"BRL"}}</script></head></html>`;
    const result = await extractGenericFromFixtureHtml(html, "https://loja.example/p");
    expect(result).toEqual({ status: "fail", reason: "no_image" });
  });
});
