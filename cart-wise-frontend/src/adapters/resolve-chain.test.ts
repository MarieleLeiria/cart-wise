import { describe, expect, it } from "vitest";
import { adaptersForUrl, runAdapterChain } from "@/adapters/resolve-chain";
import type { StoreAdapter } from "@/adapters/types";

describe("resolve-chain", () => {
  it("sempre usa generic", () => {
    const list = adaptersForUrl("https://loja.example/p", "manual");
    expect(list.map((a) => a.id)).toEqual(["generic"]);
  });

  it("falha em adapter_error quando unhandled", async () => {
    const stub: StoreAdapter = {
      id: "stub",
      matches: () => true,
      extract: () => Promise.resolve({ status: "unhandled" }),
    };
    const result = await runAdapterChain([stub], "manual");
    expect(result).toEqual({ status: "fail", reason: "adapter_error" });
  });
});
