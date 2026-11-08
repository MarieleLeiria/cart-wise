import { describe, expect, it } from "vitest";
import { productOffer, readJsonLdProducts } from "@/adapters/shared/json-ld";

describe("readJsonLdProducts", () => {
  it("lê Product em @graph e offers em array", () => {
    document.body.innerHTML = `
      <script type="application/ld+json">
        {"@graph":[{"@type":"Product","name":"G","offers":[{"price":"1","priceCurrency":"BRL"}]}]}
      </script>`;
    const products = readJsonLdProducts(document);
    expect(products).toHaveLength(1);
    const first = products[0];
    expect(first && productOffer(first)).toMatchObject({ price: "1" });
  });

  it("ignora JSON inválido", () => {
    document.body.innerHTML = `<script type="application/ld+json">not-json</script>`;
    expect(readJsonLdProducts(document)).toEqual([]);
  });
});
