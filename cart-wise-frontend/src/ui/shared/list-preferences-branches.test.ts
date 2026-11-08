import { describe, expect, it, vi } from "vitest";
import { loadListPreferences } from "@/ui/shared/list-preferences";

describe("loadListPreferences defaults", () => {
  it("retorna vazio sem chaves", async () => {
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: () => Promise.resolve({}),
        },
      },
    });
    await expect(loadListPreferences()).resolves.toEqual({});
  });
});
