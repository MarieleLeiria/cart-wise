import { describe, expect, it } from "vitest";
import { adaptersForUrl, runAdapterChain } from "@/adapters/resolve-chain";
import type { StoreAdapter } from "@/adapters/types";

describe("resolve-chain", () => {
  it("auto fora do MVP usa só generic", () => {
    const list = adaptersForUrl("https://loja.example/p", "auto");
    expect(list.map((a) => a.id)).toEqual(["generic"]);
  });

  it("auto inclui generic depois do específico", () => {
    const list = adaptersForUrl("https://www.amazon.com.br/dp/1", "auto");
    expect(list.map((a) => a.id)).toEqual(["amazon-com-br", "generic"]);
  });

  it("manual usa generic fora das cinco lojas", () => {
    const list = adaptersForUrl("https://loja.example/p", "manual");
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe("generic");
  });

  it("falha em adapter_error quando todos unhandled", async () => {
    const stub: StoreAdapter = {
      id: "stub",
      matches: () => true,
      extract: () => Promise.resolve({ status: "unhandled" }),
    };
    const result = await runAdapterChain([stub], "manual");
    expect(result).toEqual({ status: "fail", reason: "adapter_error" });
  });
});
