import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ItemCapturedMessage } from "@/shared/messages";
import * as saved from "@/storage/saved-items";

const message: ItemCapturedMessage = {
  type: "ITEM_CAPTURED",
  payload: {
    name: "Produto",
    images: ["https://cdn.example/i.jpg"],
    pageUrl: "https://www.amazon.com.br/dp/1",
    priceText: "R$ 10,00",
    currencyHint: "BRL",
    variant: {},
    adapterId: "amazon-com-br",
    trigger: "manual",
  },
};

beforeEach(() => {
  vi.stubGlobal("chrome", {
    action: { setBadgeText: vi.fn(), setBadgeBackgroundColor: vi.fn() },
  });
});

describe("persist storage_error", () => {
  it("falha ao gravar", async () => {
    vi.spyOn(saved.savedItemRepository, "upsertFromCapture").mockRejectedValue(new Error("db"));
    const { persistFromCapture } = await import("@/background/capture-flow");
    const result = await persistFromCapture(message);
    expect(result).toEqual({ ok: false, reason: "storage_error" });
  });
});
