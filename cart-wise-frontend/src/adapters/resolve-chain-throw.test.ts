import { describe, expect, it } from "vitest";
import { runAdapterChain } from "@/adapters/resolve-chain";
import type { StoreAdapter } from "@/adapters/types";

describe("runAdapterChain throws", () => {
  it("vira adapter_error", async () => {
    const stub: StoreAdapter = {
      id: "x",
      matches: () => true,
      extract: () => Promise.reject(new Error("boom")),
    };
    const result = await runAdapterChain([stub], "manual");
    expect(result).toEqual({ status: "fail", reason: "adapter_error" });
  });
});
