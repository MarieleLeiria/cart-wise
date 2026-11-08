import { describe, expect, it } from "vitest";
import { createStoreAdapter } from "@/adapters/shared/create-store-adapter";

describe("createStoreAdapter variant", () => {
  it("falha variant_not_selected", async () => {
    document.body.innerHTML = '<div data-cartwise-variant-required><select></select></div>';
    const adapter = createStoreAdapter({
      id: "mercado-livre",
      domain: "mercadolivre.com.br",
      variantRequiredCheck: () => true,
    });
    const result = await adapter.extract();
    expect(result).toEqual({ status: "fail", reason: "variant_not_selected" });
  });
});
