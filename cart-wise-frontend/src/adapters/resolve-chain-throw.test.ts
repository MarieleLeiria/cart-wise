import { describe, expect, it } from "vitest";
import { runAdapterChain } from "@/adapters/resolve-chain";
import type { StoreAdapter } from "@/adapters/types";

describe("runAdapterChain throw", () => {
  it("NFR-RES adapter throw vira adapter_error", async () => {
    const stub: StoreAdapter = {
      id: "stub",
      matches: () => true,
      extract: () => {
        throw new Error("boom");
      },
    };
    const result = await runAdapterChain([stub], "manual");
    expect(result).toEqual({ status: "fail", reason: "adapter_error" });
  });
});
