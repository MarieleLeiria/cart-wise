import { describe, expect, it } from "vitest";
import { storeAdapters } from "@/adapters/registry";

describe("storeAdapters", () => {
  it("registra adaptadores MVP + generic", () => {
    const ids = storeAdapters.map((adapter) => adapter.id).sort();
    expect(ids).toEqual([
      "amazon-com-br",
      "generic",
      "magazine-luiza",
      "mercado-livre",
      "shein",
      "shopee",
    ]);
  });
});
