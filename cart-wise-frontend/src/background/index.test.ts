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
        addListener: (fn: (typeof listeners)[number]) => {
          listeners.push(fn);
        },
      },
    },
    action: {
      setBadgeText: vi.fn(),
      setBadgeBackgroundColor: vi.fn(),
    },
    tabs: {
      get: vi.fn(),
      sendMessage: vi.fn(),
    },
  });
});

const trustedTabSender = { id: "cart-wise-ext", tab: { id: 1 } };

async function emitMessage(raw: unknown, sender: object = trustedTabSender): Promise<unknown> {
  vi.resetModules();
  await import("@/background/index");
  return new Promise((resolve) => {
    const handler = listeners.at(-1);
    expect(handler).toBeDefined();
    handler?.(raw, sender, (response) => resolve(response));
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

describe("background onMessage", () => {
  it("FR-msg ITEM_CAPTURED persiste item", async () => {
    const response = await emitMessage({ type: "ITEM_CAPTURED", payload: captured });
    expect(response).toMatchObject({ ok: true, created: true });
  });

  it("FR-msg payload invalido", async () => {
    const response = await emitMessage({ type: "ITEM_CAPTURED", payload: { type: "x" } });
    expect(response).toEqual({ ok: false, reason: "invalid_payload" });
  });
});
