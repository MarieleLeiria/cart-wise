import { beforeEach, describe, expect, it } from "vitest";
import { createStoreAdapter } from "@/adapters/shared/create-store-adapter";

describe("createStoreAdapter unhandled", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("unhandled quando sem nome", async () => {
    const adapter = createStoreAdapter({ id: "amazon-com-br", domain: "amazon.com.br" });
    const result = await adapter.extract();
    expect(result).toEqual({ status: "unhandled" });
  });
});
