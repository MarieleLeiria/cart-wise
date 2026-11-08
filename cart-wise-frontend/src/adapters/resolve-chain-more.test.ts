import { describe, expect, it } from "vitest";
import { runAdapterChain } from "@/adapters/resolve-chain";
import type { StoreAdapter } from "@/adapters/types";

describe("runAdapterChain ok", () => {
  it("retorna produto", async () => {
    const stub: StoreAdapter = {
      id: "stub",
      matches: () => true,
      extract: () =>
        Promise.resolve({
          status: "ok",
          product: {
            name: "P",
            images: ["https://cdn.example/p.jpg"],
            pageUrl: "https://loja.example/p",
            priceText: "10",
            variant: {},
            adapterId: "stub",
            trigger: "manual",
          },
        }),
    };
    const result = await runAdapterChain([stub], "manual");
    expect(result.status).toBe("ok");
  });
});
