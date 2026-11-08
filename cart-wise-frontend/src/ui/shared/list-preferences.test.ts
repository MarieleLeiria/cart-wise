import { describe, expect, it, vi } from "vitest";
import { loadListPreferences, saveListCurrency, saveListSort } from "@/ui/shared/list-preferences";

describe("list-preferences", () => {
  it("FR-LST-002 persiste moeda e ordenacao", async () => {
    const store: Record<string, unknown> = {};
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: (keys: string[]) =>
            Promise.resolve(Object.fromEntries(keys.map((k) => [k, store[k]]))),
          set: (values: Record<string, unknown>) => {
            Object.assign(store, values);
            return Promise.resolve();
          },
        },
      },
    });
    await saveListCurrency("USD");
    await saveListSort("price-desc");
    const prefs = await loadListPreferences();
    expect(prefs).toEqual({ currency: "USD", sort: "price-desc" });
  });
});
