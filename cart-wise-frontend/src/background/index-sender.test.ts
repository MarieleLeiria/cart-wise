import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CapturedProduct } from "@/shared/schemas";

const listeners: Array<
  (raw: unknown, sender: unknown, sendResponse: (r: unknown) => void) => boolean
> = [];

beforeEach(() => {
  listeners.length = 0;
  vi.stubGlobal("chrome", {
    runtime: {
      id: "cart-wise-ext",
      onMessage: {
        addListener: (fn: (typeof listeners)[number]) => listeners.push(fn),
      },
    },
    action: { setBadgeText: vi.fn(), setBadgeBackgroundColor: vi.fn() },
    tabs: { get: vi.fn(), sendMessage: vi.fn() },
  });
});

async function emit(raw: unknown, sender: object): Promise<unknown> {
  vi.resetModules();
  await import("@/background/index");
  return new Promise((resolve) => {
    listeners.at(-1)?.(raw, sender, resolve);
  });
}

const captured: CapturedProduct = {
  name: "Item",
  images: ["https://cdn.example/i.jpg"],
  pageUrl: "https://www.amazon.com.br/dp/1",
  priceText: "R$ 10,00",
  variant: {},
  adapterId: "generic",
  trigger: "manual",
};

describe("background sender checks", () => {
  it("rejeita sender estranho", async () => {
    const response = await emit({ type: "CAPTURE_FAILED", reason: "adapter_error", trigger: "auto" }, {
      id: "other",
    });
    expect(response).toEqual({ ok: false, reason: "invalid_payload" });
  });

  it("CAPTURE_ACTIVE_TAB exige UI da extensão", async () => {
    const response = await emit(
      { type: "CAPTURE_ACTIVE_TAB", tabId: 1, source: "popup" },
      { id: "cart-wise-ext", tab: { id: 1 } },
    );
    expect(response).toEqual({ ok: false, reason: "invalid_payload" });
  });

  it("ACTIVATE_SITE exige UI da extensão", async () => {
    const response = await emit(
      { type: "ACTIVATE_SITE", tabId: 1, url: "https://loja.example/p" },
      { id: "cart-wise-ext" },
    );
    expect(response).toEqual({ ok: false, reason: "invalid_payload" });
  });

  it("ITEM_CAPTURED exige tab", async () => {
    const response = await emit(
      { type: "ITEM_CAPTURED", payload: captured },
      { id: "cart-wise-ext" },
    );
    expect(response).toEqual({ ok: false, reason: "invalid_payload" });
  });
});
