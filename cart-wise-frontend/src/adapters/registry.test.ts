import { describe, expect, it } from "vitest";
import { storeAdapters } from "@/adapters/registry";

describe("storeAdapters", () => {
  it("registra só adaptador generic", () => {
    const ids = storeAdapters.map((adapter) => adapter.id);
    expect(ids).toEqual(["generic"]);
  });
});
