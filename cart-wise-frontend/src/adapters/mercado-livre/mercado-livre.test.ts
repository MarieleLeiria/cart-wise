import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractGenericFromFixtureHtml } from "@/adapters/shared/generic-extract";
import { isVariantSelectionMissing } from "@/adapters/shared/variant-check";

const fixtureDir = path.dirname(fileURLToPath(import.meta.url));

describe("mercado-livre variant fixture", () => {
  it("variant.html selecionado", async () => {
    const html = readFileSync(path.join(fixtureDir, "fixtures/variant.html"), "utf8");
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(isVariantSelectionMissing(doc)).toBe(false);
    const result = await extractGenericFromFixtureHtml(
      html,
      "https://www.mercadolivre.com.br/item/1",
    );
    expect(result.status).toBe("ok");
  });

  it("variant.html sem seleção", () => {
    const html = readFileSync(path.join(fixtureDir, "fixtures/variant.html"), "utf8").replace(
      'data-cartwise-variant-selected="true"',
      "",
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(isVariantSelectionMissing(doc)).toBe(true);
  });
});
