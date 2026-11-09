import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractGenericFromFixtureHtml } from "@/adapters/shared/generic-extract";

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");

function readFixture(name: string): string {
  return readFileSync(path.join(fixtureDir, name), "utf8");
}

describe("generic extract fixtures", () => {
  it("simple.html", async () => {
    const result = await extractGenericFromFixtureHtml(
      readFixture("simple.html"),
      "https://loja.example/p/1",
    );
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.product.name).toBe("Echo Pop");
      expect(result.product.images).toHaveLength(1);
      expect(result.product.priceText).toContain("349");
    }
  });

  it("promo.html usa preço atual", async () => {
    const result = await extractGenericFromFixtureHtml(
      readFixture("promo.html"),
      "https://loja.example/p/2",
    );
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.product.priceText).toMatch(/199/);
    }
  });
});
